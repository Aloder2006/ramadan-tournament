const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const { verifyAdmin } = require('../middleware/auth');

// ── Helpers ─────────────────────────────────────────────
function normalizePhone(phone) {
    return (phone || '').replace(/\D/g, '');
}

function validateScore(val) {
    const n = parseInt(val);
    return !isNaN(n) && n >= 0 && n <= 99 ? n : null;
}

// ── POST /api/predictions — submit (public) ──────────────
// Returns the existing prediction if phone is already used (409).
router.post('/', async (req, res) => {
    try {
        const { phone, score1, score2, deviceId } = req.body;

        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
            return res.status(400).json({ message: 'رقم الهاتف غير صالح' });
        }

        const s1 = validateScore(score1);
        const s2 = validateScore(score2);
        if (s1 === null || s2 === null) {
            return res.status(400).json({ message: 'النتيجة يجب أن تكون بين 0 و 99' });
        }

        // Check if phone already has a prediction
        const existing = await Prediction.findOne({ phone: normalizedPhone });
        if (existing) {
            return res.status(409).json({
                message: 'هذا الرقم مسجل مسبقاً',
                prediction: existing,
            });
        }

        const prediction = await Prediction.create({
            phone: normalizedPhone,
            score1: s1,
            score2: s2,
            deviceId: deviceId || null,
        });

        res.status(201).json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── PUT /api/predictions/:id — edit prediction ───────────
router.put('/:id', async (req, res) => {
    try {
        const { score1, score2, phone } = req.body;

        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
            return res.status(400).json({ message: 'رقم الهاتف غير صالح' });
        }

        const s1 = validateScore(score1);
        const s2 = validateScore(score2);
        if (s1 === null || s2 === null) {
            return res.status(400).json({ message: 'النتيجة يجب أن تكون بين 0 و 99' });
        }

        const prediction = await Prediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ message: 'التوقع غير موجود' });
        }

        // Ensure the request is from the owner (by phone match)
        if (prediction.phone !== normalizedPhone) {
            return res.status(403).json({ message: 'غير مصرح بتعديل هذا التوقع' });
        }

        prediction.score1 = s1;
        prediction.score2 = s2;
        await prediction.save();

        res.json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET /api/predictions — admin: list all ───────────────
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const predictions = await Prediction.find().sort({ createdAt: -1 });

        // Find the final match to determine correct predictions
        const finalMatch = await Match.findOne({
            knockoutRound: 'النهائي',
            status: 'Completed',
        }).lean();

        let correctScore1 = null;
        let correctScore2 = null;

        if (finalMatch) {
            correctScore1 = finalMatch.score1;
            correctScore2 = finalMatch.score2;
        }

        const result = predictions.map(p => ({
            _id: p._id,
            phone: p.phone,
            score1: p.score1,
            score2: p.score2,
            deviceId: p.deviceId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            isCorrect:
                correctScore1 !== null &&
                p.score1 === correctScore1 &&
                p.score2 === correctScore2,
        }));

        res.json({
            predictions: result,
            total: result.length,
            correctScore: finalMatch ? `${correctScore1} - ${correctScore2}` : null,
            correctCount: result.filter(p => p.isCorrect).length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── DELETE /api/predictions/:id — admin: delete ──────────
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await Prediction.findByIdAndDelete(req.params.id);
        res.json({ message: 'تم حذف التوقع' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
