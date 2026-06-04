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
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // Auto-delete after 30 days using TTL index
        expires: '30d'
    }
});

module.exports = mongoose.model('Product', ProductSchema);
