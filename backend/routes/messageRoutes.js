const express = require('express');
const router = express.Router();
const {
    getRecyclingPartners,
    sendMessage,
    getMessages,
    getUnreadCount,
    markAsRead,
    getConversation,
    getConversationList
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all recycling partners
router.get('/partners', getRecyclingPartners);

// Get all messages for current user
router.get('/', getMessages);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Get conversation with specific partner
router.get('/conversation/:partnerId', getConversation);

// Get all conversations (unique partners)
router.get('/conversations/list', getConversationList);

// Send a message
router.post('/', sendMessage);

// Mark message as read
router.put('/:messageId/read', markAsRead);

module.exports = router;
