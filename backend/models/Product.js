const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },

    description: {
        type: String,
        required: [true, 'Please add a description']
    },

    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['furniture', 'electronics', 'clothing', 'tools', 'other']
    },

    price: {
        type: String,
        default: 'Free'
    },

    location: {
        type: String
    },

    imageUrl: {
        type: String
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    isExpired: {
        type: Boolean,
        default: false
    },

    expiresAt: {
        type: Date,
        default: () =>
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);