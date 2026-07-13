const User = require('../models/User');

/**
 * Points configuration:
 *
 *   RECYCLING_POST_POINTS → credited to the user immediately when they post a
 *                           "Contact Recycling Center" listing (shown only to centres).
 *   DONOR_POINTS          → credited to the marketplace donor after dual-confirm.
 *   COLLECTOR_POINTS      → credited to the company/collector after dual-confirm.
 */
const RECYCLING_POST_POINTS = 5;
const DONOR_POINTS          = 10;
const COLLECTOR_POINTS      = 5;

/**
 * Badge tier thresholds (must stay in sync with frontend UserDashboard.js).
 *
 *   Eco Starter  →   0 – 24 pts
 *   Green Hero   →  25 – 74 pts
 *   Top Fan      →  75 – 149 pts
 *   Eco Champion → 150+ pts
 */
const BADGE_TIERS = [
    { name: 'Eco Champion', min: 150 },
    { name: 'Top Fan',      min: 75  },
    { name: 'Green Hero',   min: 25  },
    { name: 'Eco Starter',  min: 0   },
];

/**
 * Compute the badge name for a given points total.
 * @param {number} points
 * @returns {string} Badge name
 */
const computeBadge = (points) => {
    for (const tier of BADGE_TIERS) {
        if (points >= tier.min) return tier.name;
    }
    return 'Eco Starter';
};

/**
 * Atomically add points to a user and update their badge tier.
 *
 * Uses findOneAndUpdate with $inc so concurrent requests cannot double-award
 * (the DB-level increment is atomic).
 *
 * @param {string|ObjectId} userId
 * @param {number} pointsToAdd
 * @returns {Promise<{ newPoints: number, badge: string }>}
 */
const awardPointsAndBadge = async (userId, pointsToAdd) => {
    // Step 1: atomically increment points
    const updated = await User.findByIdAndUpdate(
        userId,
        { $inc: { points: pointsToAdd } },
        { new: true }
    );

    if (!updated) {
        throw new Error(`User ${userId} not found when awarding points`);
    }

    // Step 2: compute new badge from the updated total
    const newBadge = computeBadge(updated.points);

    // Step 3: persist badge only if it changed
    if (updated.badge !== newBadge) {
        await User.findByIdAndUpdate(userId, { badge: newBadge });
        updated.badge = newBadge;
    }

    return {
        newPoints: updated.points,
        badge:     updated.badge
    };
};

module.exports = {
    RECYCLING_POST_POINTS,
    DONOR_POINTS,
    COLLECTOR_POINTS,
    computeBadge,
    awardPointsAndBadge
};
