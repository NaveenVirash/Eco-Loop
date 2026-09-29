const User = require('../models/User');

/**
 * Resets weeklyPoints to 0 for all users.
 * Scheduled to run every Monday at midnight (00:00 server time).
 */
const resetWeeklyPoints = async () => {
    try {
        const result = await User.updateMany(
            { weeklyPoints: { $gt: 0 } },
            { $set: { weeklyPoints: 0 } }
        );
        console.log(`Weekly leaderboard reset: ${result.modifiedCount} users cleared.`);
    } catch (error) {
        console.error('Weekly points reset error:', error);
    }
};

module.exports = resetWeeklyPoints;
