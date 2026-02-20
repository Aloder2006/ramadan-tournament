const express = require('express');
const router = express.Router();

// Simple password auth — no JWT needed for small local app
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, token: 'ramadan-admin-ok' });
    }
    return res.status(401).json({ success: false, message: 'كلمة السر غير صحيحة' });
});

module.exports = router;
