const Message = require('../models/Message');
const User = require('../models/User');

// Get all recycling partners (companies)
exports.getRecyclingPartners = async (req, res) => {
    try {
        const partners = await User.find({ role: 'company' }).select('_id name email phone address');
        res.status(200).json({
            success: true,
            data: partners
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recycling partners'
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, subject, body } = req.body;
        const senderId = req.user._id;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                error: 'Receiver not found'
            });
        }

        // Generate conversation ID (sorted sender/receiver IDs for consistency)
        const ids = [senderId.toString(), receiverId].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            subject,
            body,
            conversationId
        });

        // Populate sender and receiver info
        await message.populate('sender', 'name email');
        await message.populate('receiver', 'name email');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message || 'Failed to send message'
        });
    }
};

// Get messages for current user
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { partnerId } = req.query; // Optional: filter by conversation partner

        let query = {
            $or: [
                { receiver: userId },
                { sender: userId }
            ]
        };

        if (partnerId) {
            query = {
                $and: [
                    {
                        $or: [
                            { receiver: userId },
                            { sender: userId }
                        ]
                    },
                    {
                        $or: [
                            { sender: partnerId },
                            { receiver: partnerId }
                        ]
                    }
                ]
            };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messages'
        });
    }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch unread count'
        });
    }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findByIdAndUpdate(
            messageId,
            { 
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        ).populate('sender', 'name email').populate('receiver', 'name email');

        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to mark message as read'
        });
    }
};

// Get conversation with a specific partner
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { partnerId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: partnerId },
                { sender: partnerId, receiver: userId }
            ]
        })
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ createdAt: 1 });

        // Mark all messages received by user as read
        await Message.updateMany(
            {
                receiver: userId,
                sender: partnerId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversation'
        });
    }
};

// Get conversation list (unique partners with last message)
exports.getConversationList = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: mongoose.Types.ObjectId(userId) },
                        { receiver: mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        // Populate partner info
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const partnerId = conv.lastMessage.sender._id.equals(userId)
                    ? conv.lastMessage.receiver
                    : conv.lastMessage.sender;

                const partner = await User.findById(partnerId).select('_id name email role');
                return {
                    _id: conv._id,
                    partner,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: populatedConversations
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversations'
        });
    }
};
