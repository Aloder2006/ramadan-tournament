const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Match = require('../models/Match');
const Team = require('../models/Team');

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
router.put('/phase', async (req, res) => {
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
router.put('/qualified', async (req, res) => {
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
router.put('/bracket-slots', async (req, res) => {
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

// PUT /api/settings/tournament-name
router.put('/tournament-name', async (req, res) => {
    try {
        const { name } = req.body;
        const settings = await Settings.getSettings();
        settings.tournamentName = name || 'دوري رمضان';
        await settings.save();
        res.json({ tournamentName: settings.tournamentName });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ════════════════════════════════════════════════════
// RESET ROUTES
// ════════════════════════════════════════════════════

// DELETE /api/settings/reset/groups
// Deletes all group-stage matches and resets all team stats to zero
router.delete('/reset/groups', async (req, res) => {
    try {
        await Match.deleteMany({ phase: { $ne: 'knockout' } });
        await Team.updateMany({}, {
            $set: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }
        });
        res.json({ message: '✅ تم إعادة تعيين دور المجموعات — حُذفت جميع مباريات المجموعات وأُعيدت إحصائيات الفرق' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/settings/reset/knockout
// Deletes all KO matches, clears bracket + qualified teams + resets phase to groups
router.delete('/reset/knockout', async (req, res) => {
    try {
        await Match.deleteMany({ phase: 'knockout' });

        const settings = await Settings.getSettings();
        settings.qualifiedTeams = [];
        settings.bracketSlots = Array.from({ length: 8 }, (_, i) => ({ position: i + 1, team: null }));
        settings.phase = 'groups';
        await settings.save();

        res.json({ message: '✅ تم إعادة تعيين دور الإقصاء — حُذفت مباريات الإقصاء وأُفرغت القرعة' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/settings/reset/all
// Full reset — deletes ALL matches, ALL teams, resets settings completely
router.delete('/reset/all', async (req, res) => {
    try {
        await Match.deleteMany({});
        await Team.deleteMany({});

        const settings = await Settings.getSettings();
        settings.qualifiedTeams = [];
        settings.bracketSlots = Array.from({ length: 8 }, (_, i) => ({ position: i + 1, team: null }));
        settings.phase = 'groups';
        settings.tournamentName = 'دوري رمضان';
        await settings.save();

        res.json({ message: '✅ تم إعادة تعيين البطولة بالكامل — حُذفت جميع الفرق والمباريات' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
