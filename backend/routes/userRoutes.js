const express = require('express');
const { getUsers, getUser, deleteUser, updateUserStatus, getUserProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route for leaderboard
router.get('/leaderboard', getUsers);

// Profile view — any authenticated user (for admin modals and future user-to-user view)
router.get('/:id/profile', protect, getUserProfile);

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .delete(deleteUser);

router.route('/:id/status')
    .put(updateUserStatus);

module.exports = router;
