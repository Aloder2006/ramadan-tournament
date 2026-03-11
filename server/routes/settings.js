const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Match = require('../models/Match');
const Team = require('../models/Team');
const { verifyAdmin, rateLimitVisit } = require('../middleware/auth');

// ── Shared: Group Ranking Engine ────────────────────────
const GROUPS = ['أ', 'ب', 'ج', 'د'];

async function computeRankings() {
    const allTeams = await Team.find().lean();
    const allMatches = await Match.find({ phase: { $ne: 'knockout' }, status: 'Completed' }).lean();

    // Build H2H lookup
    const h2h = {};
    for (const m of allMatches) {
        const t1 = m.team1.toString();
        const t2 = m.team2.toString();
        if (!h2h[t1]) h2h[t1] = {};
        if (!h2h[t2]) h2h[t2] = {};
        if (!h2h[t1][t2]) h2h[t1][t2] = { wins: 0, gf: 0, ga: 0 };
        if (!h2h[t2][t1]) h2h[t2][t1] = { wins: 0, gf: 0, ga: 0 };
        h2h[t1][t2].gf += m.score1; h2h[t1][t2].ga += m.score2;
        h2h[t2][t1].gf += m.score2; h2h[t2][t1].ga += m.score1;
        if (m.score1 > m.score2) h2h[t1][t2].wins++;
        else if (m.score2 > m.score1) h2h[t2][t1].wins++;
    }

    const h2hWins = (a, b) => (h2h[a._id?.toString()]?.[b._id?.toString()]?.wins || 0);
    const h2hGD = (a, b) => {
        const r = h2h[a._id?.toString()]?.[b._id?.toString()];
        return r ? r.gf - r.ga : 0;
    };

    const sortTeams = (teams) => {
        teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdDiff = (b.gf - b.ga) - (a.gf - a.ga);
            if (gdDiff !== 0) return gdDiff;
            const h2hW = h2hWins(b, a) - h2hWins(a, b);
            if (h2hW !== 0) return h2hW;
            const h2hGDiff = h2hGD(b, a) - h2hGD(a, b);
            if (h2hGDiff !== 0) return h2hGDiff;
            return b.gf - a.gf;
        });
        return teams;
    };

    const rankings = {};
    for (const g of GROUPS) {
        const teams = allTeams.filter(t => t.group === g);
        sortTeams(teams);
        rankings[g] = teams.map((t, i) => ({
            _id: t._id, name: t.name, group: t.group,
            points: t.points, gf: t.gf, ga: t.ga,
            gd: t.gf - t.ga, played: t.played, rank: i + 1,
        }));
    }
    return rankings;
}

// ── Color validation helper ─────────────────────────────
function isValidHex(str) {
    return !str || /^#[0-9A-Fa-f]{6}$/.test(str);
}

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        await settings.populate('qualifiedTeams', 'name group points gd gf');
        await settings.populate('bracketSlots.team', 'name group');
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/settings/phase
router.put('/phase', verifyAdmin, async (req, res) => {
    try {
        const { phase } = req.body;
        if (!['groups', 'knockout'].includes(phase))
            return res.status(400).json({ message: 'مرحلة غير صالحة' });
        const settings = await Settings.getSettings();
        settings.phase = phase;
        await settings.save();
        res.json({ phase: settings.phase });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/settings/qualified
router.put('/qualified', verifyAdmin, async (req, res) => {
    try {
        const { teamIds } = req.body;
        if (!Array.isArray(teamIds))
            return res.status(400).json({ message: 'teamIds يجب أن تكون مصفوفة' });
        const settings = await Settings.getSettings();
        settings.qualifiedTeams = teamIds;
        await settings.save();
        await settings.populate('qualifiedTeams', 'name group points gd gf');
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/settings/bracket-slots — also auto-creates QF matches
router.put('/bracket-slots', verifyAdmin, async (req, res) => {
    try {
        const { slots } = req.body;
        if (!Array.isArray(slots))
            return res.status(400).json({ message: 'slots مطلوبة' });

        const settings = await Settings.getSettings();

        for (const { position, teamId } of slots) {
            const existing = settings.bracketSlots.find(s => s.position === position);
            if (existing) {
                existing.team = teamId || null;
            } else {
                settings.bracketSlots.push({ position, team: teamId || null });
            }
        }
        await settings.save();
        await settings.populate('bracketSlots.team', 'name group');

        // Auto-create QF matches for complete pairs
        const createdMatches = [];
        const pairs = [[1, 2], [3, 4], [5, 6], [7, 8]];

        for (let i = 0; i < pairs.length; i++) {
            const [posA, posB] = pairs[i];
            const bracketPos = i + 1;
            const slotA = settings.bracketSlots.find(s => s.position === posA);
            const slotB = settings.bracketSlots.find(s => s.position === posB);

            if (!slotA?.team || !slotB?.team) continue;

            const exists = await Match.findOne({ knockoutRound: 'ربع النهائي', bracketPosition: bracketPos });
            if (exists) continue;

            await Match.create({
                team1: slotA.team._id || slotA.team,
                team2: slotB.team._id || slotB.team,
                group: 'knockout',
                phase: 'knockout',
                knockoutRound: 'ربع النهائي',
                bracketPosition: bracketPos,
            });
            createdMatches.push(bracketPos);
        }

        res.json({ ...settings.toObject(), autoCreatedQF: createdMatches });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/settings/rankings
router.get('/rankings', async (req, res) => {
    try {
        const rankings = await computeRankings();
        res.json(rankings);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/settings/generate-knockout
router.post('/generate-knockout', verifyAdmin, async (req, res) => {
    try {
        const rankings = await computeRankings();

        // Validate groups have enough teams
        for (const g of GROUPS) {
            if (!rankings[g] || rankings[g].length < 2) {
                return res.status(400).json({
                    message: `المجموعة «${g}» لا تحتوي على فريقين كافيين لإنشاء القرعة`
                });
            }
        }

        const first = (g) => rankings[g][0];
        const second = (g) => rankings[g][1];

        // Scissors seeding
        const seeding = [
            { t1: first('أ'), t2: second('ب'), pos: 1 },
            { t1: first('ج'), t2: second('د'), pos: 2 },
            { t1: first('ب'), t2: second('أ'), pos: 3 },
            { t1: first('د'), t2: second('ج'), pos: 4 },
        ];

        for (const s of seeding) {
            if (!s.t1 || !s.t2) return res.status(400).json({
                message: 'لا يوجد فريقان كافيان في إحدى المجموعات لإنشاء القرعة'
            });
        }

        // Delete old KO matches & reset slots
        await Match.deleteMany({ phase: 'knockout' });

        const settings = await Settings.getSettings();
        settings.phase = 'knockout';
        settings.qualifiedTeams = seeding.flatMap(s => [s.t1._id, s.t2._id]);
        settings.bracketSlots = [
            { position: 1, team: seeding[0].t1._id },
            { position: 2, team: seeding[0].t2._id },
            { position: 3, team: seeding[1].t1._id },
            { position: 4, team: seeding[1].t2._id },
            { position: 5, team: seeding[2].t1._id },
            { position: 6, team: seeding[2].t2._id },
            { position: 7, team: seeding[3].t1._id },
            { position: 8, team: seeding[3].t2._id },
        ];
        await settings.save();

        // Create 4 QF matches
        await Match.insertMany(seeding.map(s => ({
            team1: s.t1._id,
            team2: s.t2._id,
            group: 'knockout',
            phase: 'knockout',
            knockoutRound: 'ربع النهائي',
            bracketPosition: s.pos,
            status: 'Pending',
        })));

        await settings.populate('bracketSlots.team', 'name group');
        await settings.populate('qualifiedTeams', 'name group points');

        res.json({
            message: '✅ تم توليد ربع النهائي بنجاح',
            bracket: seeding.map(s => ({
                position: s.pos,
                team1: { name: s.t1.name, group: s.t1.group },
                team2: { name: s.t2.name, group: s.t2.group },
            })),
            settings,
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/settings/tournament-name
router.put('/tournament-name', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (name && name.length > 80) return res.status(400).json({ message: 'الاسم طويل جدًا' });
        const settings = await Settings.getSettings();
        settings.tournamentName = name || 'دوري رمضان';
        await settings.save();
        res.json({ tournamentName: settings.tournamentName });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/settings/info — update all tournament identity + color + font fields
router.put('/info', verifyAdmin, async (req, res) => {
    try {
        const {
            tournamentName, subtitle, logoEmoji,
            primaryColor, secondaryColor,
            colorBgBase, colorBgCard, colorBorder,
            colorTextPrimary, colorSuccess, colorDanger, colorIndigo,
            logoFont, bodyFont,
        } = req.body;

        // Validate colors
        const colors = { primaryColor, secondaryColor, colorBgBase, colorBgCard, colorBorder, colorTextPrimary, colorSuccess, colorDanger, colorIndigo };
        for (const [key, val] of Object.entries(colors)) {
            if (val !== undefined && !isValidHex(val)) {
                return res.status(400).json({ message: `لون غير صالح: ${key}` });
            }
        }

        // Validate string lengths
        if (tournamentName !== undefined && tournamentName.length > 80) return res.status(400).json({ message: 'اسم البطولة طويل جدًا' });
        if (subtitle !== undefined && subtitle.length > 100) return res.status(400).json({ message: 'النص الفرعي طويل جدًا' });
        if (logoEmoji !== undefined && logoEmoji.length > 8) return res.status(400).json({ message: 'الشعار طويل جدًا' });

        const settings = await Settings.getSettings();
        if (tournamentName !== undefined) settings.tournamentName = tournamentName || 'دوري رمضان';
        if (subtitle !== undefined) settings.subtitle = subtitle;
        if (logoEmoji !== undefined) settings.logoEmoji = logoEmoji;
        if (primaryColor !== undefined) settings.primaryColor = primaryColor;
        if (secondaryColor !== undefined) settings.secondaryColor = secondaryColor;
        if (colorBgBase !== undefined) settings.colorBgBase = colorBgBase;
        if (colorBgCard !== undefined) settings.colorBgCard = colorBgCard;
        if (colorBorder !== undefined) settings.colorBorder = colorBorder;
        if (colorTextPrimary !== undefined) settings.colorTextPrimary = colorTextPrimary;
        if (colorSuccess !== undefined) settings.colorSuccess = colorSuccess;
        if (colorDanger !== undefined) settings.colorDanger = colorDanger;
        if (colorIndigo !== undefined) settings.colorIndigo = colorIndigo;
        if (logoFont !== undefined) settings.logoFont = logoFont;
        if (bodyFont !== undefined) settings.bodyFont = bodyFont;
        await settings.save();
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/settings/visit
router.post('/visit', rateLimitVisit, async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        settings.visitorsCount = (settings.visitorsCount || 0) + 1;
        await settings.save();
        res.json({ visitorsCount: settings.visitorsCount });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ═══════════════════════════════════════════════════════
// RESET ROUTES
// ═══════════════════════════════════════════════════════

// DELETE /api/settings/reset/groups
router.delete('/reset/groups', verifyAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password !== process.env.RESET_PASSWORD) {
            return res.status(403).json({ message: 'كلمة المرور غير صحيحة' });
        }
        await Match.deleteMany({ phase: { $ne: 'knockout' } });
        await Team.updateMany({}, {
            $set: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }
        });
        res.json({ message: '✅ تم إعادة تعيين دور المجموعات' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/settings/reset/knockout
router.delete('/reset/knockout', verifyAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password !== process.env.RESET_PASSWORD) {
            return res.status(403).json({ message: 'كلمة المرور غير صحيحة' });
        }
        await Match.deleteMany({ phase: 'knockout' });
        const settings = await Settings.getSettings();
        settings.qualifiedTeams = [];
        settings.bracketSlots = Array.from({ length: 8 }, (_, i) => ({ position: i + 1, team: null }));
        settings.phase = 'groups';
        await settings.save();
        res.json({ message: '✅ تم إعادة تعيين دور الإقصاء' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/settings/reset/all
router.delete('/reset/all', verifyAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password !== process.env.RESET_PASSWORD) {
            return res.status(403).json({ message: 'كلمة المرور غير صحيحة' });
        }
        await Match.deleteMany({});
        await Team.deleteMany({});
        const settings = await Settings.getSettings();
        settings.qualifiedTeams = [];
        settings.bracketSlots = Array.from({ length: 8 }, (_, i) => ({ position: i + 1, team: null }));
        settings.phase = 'groups';
        settings.tournamentName = 'دوري رمضان';
        await settings.save();
        res.json({ message: '✅ تم إعادة تعيين البطولة بالكامل' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
