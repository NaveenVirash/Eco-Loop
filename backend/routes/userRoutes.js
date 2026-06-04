const express = require('express');
const { getUsers, getUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route for leaderboard
router.get('/leaderboard', getUsers);

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .delete(deleteUser);

module.exports = router;
