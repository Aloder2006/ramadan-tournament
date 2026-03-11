const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');
const { verifyAdmin } = require('../middleware/auth');

// ── Helpers ─────────────────────────────────────────────
async function applyMatchStats(match, { reverse = false } = {}) {
    if (match.phase === 'knockout') return;

    const mult = reverse ? -1 : 1;
    const s1 = match.score1;
    const s2 = match.score2;

    const t1Inc = { played: 1 * mult, gf: s1 * mult, ga: s2 * mult, gd: (s1 - s2) * mult };
    const t2Inc = { played: 1 * mult, gf: s2 * mult, ga: s1 * mult, gd: (s2 - s1) * mult };

    if (s1 > s2) {
        t1Inc.won = 1 * mult; t1Inc.points = 3 * mult;
        t2Inc.lost = 1 * mult; t2Inc.points = 0;
    } else if (s2 > s1) {
        t2Inc.won = 1 * mult; t2Inc.points = 3 * mult;
        t1Inc.lost = 1 * mult; t1Inc.points = 0;
    } else {
        t1Inc.drawn = 1 * mult; t1Inc.points = 1 * mult;
        t2Inc.drawn = 1 * mult; t2Inc.points = 1 * mult;
    }

    await Promise.all([
        Team.findByIdAndUpdate(match.team1, { $inc: t1Inc }),
        Team.findByIdAndUpdate(match.team2, { $inc: t2Inc }),
    ]);
}

function validateScore(val) {
    const n = parseInt(val);
    return !isNaN(n) && n >= 0 && n <= 99 ? n : null;
}

function getDateRange(offsetDays = 0) {
    const now = new Date();
    const localNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const start = new Date(Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate() + offsetDays,
        0, 0, 0, 0
    ) - 2 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
}

// ── GET Routes ──────────────────────────────────────────

// GET /api/matches/today
router.get('/today', async (req, res) => {
    try {
        const { start, end } = getDateRange(0);
        const matches = await Match.find({ matchDate: { $gte: start, $lt: end } })
            .populate('team1', 'name group')
            .populate('team2', 'name group')
            .sort({ matchDate: 1 });
        res.json(matches);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/matches/tomorrow
router.get('/tomorrow', async (req, res) => {
    try {
        const { start, end } = getDateRange(1);
        const matches = await Match.find({ matchDate: { $gte: start, $lt: end } })
            .populate('team1', 'name group')
            .populate('team2', 'name group')
            .sort({ matchDate: 1 });
        res.json(matches);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/matches/history
router.get('/history', async (req, res) => {
    try {
        const matches = await Match.find({ status: 'Completed' })
            .populate('team1', 'name group')
            .populate('team2', 'name group')
            .sort({ updatedAt: -1 });
        res.json(matches);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/matches — optional ?phase filter
router.get('/', async (req, res) => {
    try {
        const { phase } = req.query;
        const filter = phase ? { phase } : {};
        const matches = await Match.find(filter)
            .populate('team1', 'name group')
            .populate('team2', 'name group')
            .sort({ matchDate: 1, createdAt: -1 });
        res.json(matches);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── POST /api/matches ───────────────────────────────────
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { team1, team2, group, phase, redCards1, redCards2, knockoutRound, matchDate, bracketPosition } = req.body;
        if (!team1 || !team2 || !group)
            return res.status(400).json({ message: 'الفريقان والمجموعة مطلوبة' });
        if (team1 === team2)
            return res.status(400).json({ message: 'لا يمكن أن يلعب الفريق ضد نفسه' });

        // Validate teams exist
        const [t1, t2] = await Promise.all([Team.findById(team1), Team.findById(team2)]);
        if (!t1 || !t2) return res.status(404).json({ message: 'أحد الفريقين غير موجود' });

        // Validate matchDate if provided
        let parsedDate = null;
        if (matchDate) {
            parsedDate = new Date(matchDate);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: 'تاريخ المباراة غير صالح' });
            }
        }

        const match = await Match.create({
            team1, team2, group,
            phase: phase || 'groups',
            redCards1: redCards1 || 0,
            redCards2: redCards2 || 0,
            knockoutRound: knockoutRound || null,
            matchDate: parsedDate,
            bracketPosition: bracketPosition || null,
        });
        const populated = await match.populate([
            { path: 'team1', select: 'name group' },
            { path: 'team2', select: 'name group' },
        ]);
        res.status(201).json(populated);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── PUT /api/matches/:id ────────────────────────────────
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const {
            matchDate, score1, score2, redCards1, redCards2,
            hasPenalties, penaltyScore1, penaltyScore2,
            status, knockoutRound, group,
        } = req.body;

        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });

        // Reverse previous stats if already completed
        if (match.status === 'Completed') {
            await applyMatchStats(match, { reverse: true });
        }

        // Update date
        if (matchDate !== undefined) {
            if (matchDate) {
                const d = new Date(matchDate);
                if (isNaN(d.getTime())) return res.status(400).json({ message: 'تاريخ غير صالح' });
                match.matchDate = d;
            } else {
                match.matchDate = null;
            }
        }

        // Update score / status
        if (status === 'Completed' && score1 !== undefined && score2 !== undefined) {
            const s1 = validateScore(score1);
            const s2 = validateScore(score2);
            if (s1 === null || s2 === null) {
                return res.status(400).json({ message: 'النتيجة يجب أن تكون بين 0 و 99' });
            }
            match.score1 = s1;
            match.score2 = s2;
            match.status = 'Completed';
            match.redCards1 = parseInt(redCards1) || 0;
            match.redCards2 = parseInt(redCards2) || 0;

            if (hasPenalties && s1 === s2) {
                match.hasPenalties = true;
                match.penaltyScore1 = parseInt(penaltyScore1) || 0;
                match.penaltyScore2 = parseInt(penaltyScore2) || 0;
            } else {
                match.hasPenalties = false;
                match.penaltyScore1 = null;
                match.penaltyScore2 = null;
            }
        } else if (status === 'Pending') {
            match.status = 'Pending';
            match.score1 = null;
            match.score2 = null;
            match.hasPenalties = false;
            match.penaltyScore1 = null;
            match.penaltyScore2 = null;
        }

        if (knockoutRound !== undefined) match.knockoutRound = knockoutRound;
        if (group !== undefined) match.group = group;
        if (redCards1 !== undefined && match.status !== 'Completed') match.redCards1 = parseInt(redCards1) || 0;
        if (redCards2 !== undefined && match.status !== 'Completed') match.redCards2 = parseInt(redCards2) || 0;

        await match.save();

        // Apply new stats if completed
        if (match.status === 'Completed') {
            await applyMatchStats(match, { reverse: false });
        }

        const updated = await Match.findById(match._id)
            .populate('team1', 'name group')
            .populate('team2', 'name group');

        res.json({ message: 'تم تحديث المباراة بنجاح', match: updated });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── DELETE /api/matches/:id ─────────────────────────────
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });
        if (match.status === 'Completed') await applyMatchStats(match, { reverse: true });
        await Match.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف المباراة' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
