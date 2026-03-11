const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
    JWT_SECRET,
    TOKEN_EXPIRY,
    loginRateLimit,
    recordFailedLogin,
    clearLoginAttempts,
} = require('../middleware/auth');

// POST /api/auth/login — rate-limited, brute-force protected
router.post('/login', loginRateLimit, (req, res) => {
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length > 128) {
        return res.status(400).json({ success: false, message: 'كلمة سر غير صالحة' });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
        clearLoginAttempts(req._loginIp);
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        return res.json({ success: true, token });
    }

    // Record failed attempt
    recordFailedLogin(req._loginIp);
    return res.status(401).json({ success: false, message: 'كلمة السر غير صحيحة' });
});

module.exports = router;
