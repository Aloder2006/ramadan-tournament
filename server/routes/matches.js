const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');

// Helper: apply or reverse stats for a COMPLETED GROUP STAGE match
async function applyMatchStats(match, { reverse = false } = {}) {
    // Only apply stats for group stage matches
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

// GET /api/matches/today
router.get('/today', async (req, res) => {
    try {
        const matches = await Match.find({ isToday: true, status: 'Pending' })
            .populate('team1', 'name')
            .populate('team2', 'name');
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

// POST /api/matches
router.post('/', async (req, res) => {
    try {
        const { team1, team2, group, phase, redCards1, redCards2, knockoutRound, matchDate, bracketPosition } = req.body;
        if (!team1 || !team2 || !group)
            return res.status(400).json({ message: 'الفريقان والمجموعة مطلوبة' });
        if (team1 === team2)
            return res.status(400).json({ message: 'لا يمكن أن يلعب الفريق ضد نفسه' });

        const match = await Match.create({
            team1, team2, group,
            phase: phase || 'groups',
            redCards1: redCards1 || 0,
            redCards2: redCards2 || 0,
            knockoutRound: knockoutRound || null,
            matchDate: matchDate ? new Date(matchDate) : null,
            bracketPosition: bracketPosition || null,
        });
        const populated = await match.populate([
            { path: 'team1', select: 'name group' },
            { path: 'team2', select: 'name group' },
        ]);
        res.status(201).json(populated);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PATCH /api/matches/:id/toggle-today
router.patch('/:id/toggle-today', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });
        if (match.status === 'Completed')
            return res.status(400).json({ message: 'لا يمكن تغيير مباراة منتهية' });
        match.isToday = !match.isToday;
        await match.save();
        res.json(match);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PATCH /api/matches/:id/date
router.patch('/:id/date', async (req, res) => {
    try {
        const { matchDate } = req.body;
        const match = await Match.findByIdAndUpdate(
            req.params.id,
            { matchDate: matchDate ? new Date(matchDate) : null },
            { new: true }
        ).populate('team1', 'name group').populate('team2', 'name group');
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });
        res.json(match);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/matches/:id/result
router.put('/:id/result', async (req, res) => {
    try {
        const { score1, score2, redCards1, redCards2, hasPenalties, penaltyScore1, penaltyScore2 } = req.body;
        const s1 = parseInt(score1);
        const s2 = parseInt(score2);

        if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0)
            return res.status(400).json({ message: 'أهداف غير صالحة' });

        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });

        // Reverse previous stats if already completed
        if (match.status === 'Completed') await applyMatchStats(match, { reverse: true });

        match.score1 = s1;
        match.score2 = s2;
        match.status = 'Completed';
        match.isToday = false;
        if (redCards1 !== undefined) match.redCards1 = parseInt(redCards1) || 0;
        if (redCards2 !== undefined) match.redCards2 = parseInt(redCards2) || 0;

        // Penalties (only for knockout draws)
        if (hasPenalties && s1 === s2) {
            match.hasPenalties = true;
            match.penaltyScore1 = parseInt(penaltyScore1) || 0;
            match.penaltyScore2 = parseInt(penaltyScore2) || 0;
        } else {
            match.hasPenalties = false;
            match.penaltyScore1 = null;
            match.penaltyScore2 = null;
        }

        await match.save();
        await applyMatchStats(match, { reverse: false });

        const updated = await Match.findById(match._id)
            .populate('team1', 'name group')
            .populate('team2', 'name group');

        res.json({ message: 'تم حفظ النتيجة بنجاح', match: updated });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/matches/:id
router.delete('/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'المباراة غير موجودة' });
        if (match.status === 'Completed') await applyMatchStats(match, { reverse: true });
        await Match.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف المباراة' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
