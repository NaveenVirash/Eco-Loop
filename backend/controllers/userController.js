const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get top 10 users by points
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await User.find({ role: 'user', status: 'active' })
            .select('name points createdAt averageRating ratingCount')
            .sort({ points: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            data: topUsers
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        user.status = status;
        await user.save();
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get public profile of a user (safe fields)
// @route   GET /api/users/:id/profile
// @access  Private (any authenticated user)
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('_id name email role status points bio website phone address createdAt averageRating ratingCount ratings')
            .populate({
                path: 'ratings.user',
                select: 'name'
            });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Rate a user or company
// @route   POST /api/users/:id/rate
// @access  Private
exports.rateUser = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const targetUserId = req.params.id;
        const reviewerId = req.user.id;

        // Prevent self-rating
        if (targetUserId === reviewerId.toString()) {
            return res.status(400).json({ success: false, error: 'You cannot rate yourself' });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if already rated by this user
        const alreadyRated = user.ratings.find(
            (r) => r.user.toString() === reviewerId.toString()
        );

        if (alreadyRated) {
            return res.status(400).json({ success: false, error: 'You have already rated this user' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Please provide a valid rating between 1 and 5' });
        }

        const newRating = {
            user: reviewerId,
            rating: Number(rating),
            comment
        };

        user.ratings.push(newRating);
        user.ratingCount = user.ratings.length;
        user.averageRating = user.ratings.reduce((acc, item) => item.rating + acc, 0) / user.ratings.length;

        await user.save();

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
