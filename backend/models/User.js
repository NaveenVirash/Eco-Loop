const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'company'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    points: {
        type: Number,
        default: 0
    },
    /**
     * Badge tier — automatically updated by awardPointsAndBadge() whenever
     * Eco-Points are credited. Stored here so any client can read it without
     * recomputing thresholds.
     *
     * Thresholds:
     *   Eco Starter  →   0 – 24 pts
     *   Green Hero   →  25 – 74 pts
     *   Top Fan      →  75 – 149 pts
     *   Eco Champion → 150+ pts
     */
    badge: {
        type: String,
        enum: ['Eco Starter', 'Green Hero', 'Top Fan', 'Eco Champion'],
        default: 'Eco Starter'
    },
    bio: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
