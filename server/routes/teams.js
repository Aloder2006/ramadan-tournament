const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// POST /api/teams — create team
router.post('/', async (req, res) => {
    try {
        const { name, group } = req.body;
        if (!name || !group) return res.status(400).json({ message: 'الاسم والمجموعة مطلوبان' });
        const team = await Team.create({ name, group });
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
router.put('/:id', async (req, res) => {
    try {
        const { name, group } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (group) updates.group = group;
        const team = await Team.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!team) return res.status(404).json({ message: 'الفريق غير موجود' });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/teams/:id — delete team
router.delete('/:id', async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف الفريق' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
