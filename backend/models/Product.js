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

    collectedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    listingType: {
        type: String,
        enum: ['marketplace', 'recycling'],
        default: 'marketplace'
    },

    // ─── Dual-Confirmation Workflow ───────────────────────────────────────────

    /**
     * Lifecycle states:
     *   active             → visible to everyone, awaiting collection claim
     *   pending_collection → a collector has claimed it; awaiting donor confirmation
     *   completed          → both parties confirmed; hidden from public; data preserved
     */
    status: {
        type: String,
        enum: ['active', 'pending_collection', 'completed'],
        default: 'active'
    },

    // ─── Legacy / Cron-expiry fields (kept for backward-compat) ──────────────

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