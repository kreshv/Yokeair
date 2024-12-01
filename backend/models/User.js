const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'broker'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add compound index
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 