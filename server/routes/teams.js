const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Match = require('../models/Match');
const { verifyAdmin } = require('../middleware/auth');

// POST /api/teams — create team
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { name, group } = req.body;
        if (!name || !group) return res.status(400).json({ message: 'الاسم والمجموعة مطلوبان' });

        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 40) {
            return res.status(400).json({ message: 'اسم الفريق يجب أن يكون بين 2 و 40 حرفاً' });
        }

        // Check duplicate name in same group
        const existing = await Team.findOne({ name: trimmed, group });
        if (existing) {
            return res.status(409).json({ message: `الفريق "${trimmed}" موجود بالفعل في المجموعة ${group}` });
        }

        const team = await Team.create({ name: trimmed, group });
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/teams — get all teams sorted
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find().sort({ group: 1, points: -1, gd: -1, gf: -1 });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/teams/:id — edit team name or group
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, group } = req.body;
        const updates = {};
        if (name) {
            const trimmed = name.trim();
            if (trimmed.length < 2 || trimmed.length > 40) {
                return res.status(400).json({ message: 'اسم الفريق يجب أن يكون بين 2 و 40 حرفاً' });
            }
            updates.name = trimmed;
        }
        if (group) updates.group = group;

        // Check duplicates if name or group changed
        if (updates.name || updates.group) {
            const team = await Team.findById(req.params.id);
            if (!team) return res.status(404).json({ message: 'الفريق غير موجود' });

            const checkName = updates.name || team.name;
            const checkGroup = updates.group || team.group;
            const dup = await Team.findOne({ name: checkName, group: checkGroup, _id: { $ne: req.params.id } });
            if (dup) {
                return res.status(409).json({ message: `الفريق "${checkName}" موجود بالفعل في المجموعة ${checkGroup}` });
            }
        }

        const team = await Team.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!team) return res.status(404).json({ message: 'الفريق غير موجود' });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/teams/:id — delete team (with cascading protection warning)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'الفريق غير موجود' });

        // Check if team has matches
        const matchCount = await Match.countDocuments({
            $or: [{ team1: req.params.id }, { team2: req.params.id }],
        });

        // Delete related matches first if forced, otherwise just warn
        if (matchCount > 0) {
            await Match.deleteMany({
                $or: [{ team1: req.params.id }, { team2: req.params.id }],
            });
        }

        await Team.findByIdAndDelete(req.params.id);
        res.json({
            message: 'تم حذف الفريق',
            deletedMatches: matchCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
