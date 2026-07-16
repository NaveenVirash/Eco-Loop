const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'completed', 'rejected', 'cancelled'],
        default: 'requested'
    },
    buyerConfirmed: {
        type: Boolean,
        default: false
    },
    sellerConfirmed: {
        type: Boolean,
        default: false
    },
    buyerConfirmedAt: {
        type: Date
    },
    sellerConfirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    pointsAwarded: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
