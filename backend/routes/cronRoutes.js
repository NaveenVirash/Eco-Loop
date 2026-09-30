const express = require('express');
const resetWeeklyPoints = require('../jobs/weeklyResetJob');
const expireProducts   = require('../jobs/productExpiryJob');

const router = express.Router();

/**
 * Middleware: validate the shared CRON_SECRET header so only Vercel's
 * scheduler (or an authorised caller) can trigger these endpoints.
 */
const verifyCronSecret = (req, res, next) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // If CRON_SECRET is not configured, block all calls for safety
        return res.status(500).json({ success: false, error: 'CRON_SECRET is not configured on the server.' });
    }
    const provided = req.headers['x-cron-secret'];
    if (!provided || provided !== secret) {
        return res.status(401).json({ success: false, error: 'Unauthorised cron request.' });
    }
    next();
};

// @desc    Reset weekly leaderboard points — every Monday 00:00 UTC
// @route   GET /api/cron/weekly-reset
// @access  Internal (CRON_SECRET required)
router.get('/weekly-reset', verifyCronSecret, async (req, res) => {
    try {
        await resetWeeklyPoints();
        res.status(200).json({ success: true, message: 'Weekly points reset complete.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Expire stale product listings — every day 00:00 UTC
// @route   GET /api/cron/expire-products
// @access  Internal (CRON_SECRET required)
router.get('/expire-products', verifyCronSecret, async (req, res) => {
    try {
        await expireProducts();
        res.status(200).json({ success: true, message: 'Product expiry check complete.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
