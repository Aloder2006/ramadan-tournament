const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ramadan-tournament-secret-key-2025';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h';

// ── JWT Admin verification ──────────────────────────────
function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'غير مصرح — يرجى تسجيل الدخول' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'جلسة منتهية — يرجى إعادة تسجيل الدخول' });
    }
}

// ── Brute-Force Protection ──────────────────────────────
const loginAttempts = new Map(); // ip -> { count, firstAttempt, lockUntil }
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000;

function loginRateLimit(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = loginAttempts.get(ip);

    // Clean old entries periodically
    if (loginAttempts.size > 500) {
        for (const [k, v] of loginAttempts) {
            if (now - v.firstAttempt > ATTEMPT_WINDOW * 2) loginAttempts.delete(k);
        }
    }

    if (record) {
        // Check if still locked out
        if (record.lockUntil && now < record.lockUntil) {
            const remaining = Math.ceil((record.lockUntil - now) / 60000);
            return res.status(429).json({
                message: `تم قفل الحساب مؤقتاً. حاول مرة أخرى بعد ${remaining} دقيقة`,
                locked: true,
                retryAfter: record.lockUntil,
            });
        }
        // Reset if window expired
        if (now - record.firstAttempt > ATTEMPT_WINDOW) {
            loginAttempts.delete(ip);
        }
    }

    // Attach helpers for the route
    req._loginIp = ip;
    next();
}

function recordFailedLogin(ip) {
    const now = Date.now();
    const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
        record.lockUntil = now + LOCKOUT_WINDOW;
    }
    loginAttempts.set(ip, record);
}

function clearLoginAttempts(ip) {
    loginAttempts.delete(ip);
}

// ── Visit Rate Limiter ──────────────────────────────────
const visitCache = new Map();
const VISIT_COOLDOWN = 60 * 60 * 1000;

function rateLimitVisit(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const lastVisit = visitCache.get(ip);

    if (lastVisit && now - lastVisit < VISIT_COOLDOWN) {
        return res.json({ visitorsCount: null, rateLimited: true });
    }
    visitCache.set(ip, now);

    if (visitCache.size > 1000) {
        for (const [k, v] of visitCache) {
            if (now - v > VISIT_COOLDOWN) visitCache.delete(k);
        }
    }
    next();
}

module.exports = {
    verifyAdmin,
    rateLimitVisit,
    loginRateLimit,
    recordFailedLogin,
    clearLoginAttempts,
    JWT_SECRET,
    TOKEN_EXPIRY,
};
