const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'broker'],
        required: true,
        default: 'client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    phone: {
        type: String,
        trim: true
    }
});

// Add compound index
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 