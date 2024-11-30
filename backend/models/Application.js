const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: [{
        type: {
            type: String,
            enum: ['id', 'bank_statement', 'pay_stub', 'reference_letter', 'other'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    applicationType: {
        type: String,
        enum: ['rental', 'purchase'],
        required: true
    },
    monthlyIncome: {
        type: Number,
        required: true
    },
    employmentInfo: {
        employer: String,
        position: String,
        yearsEmployed: Number
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
applicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Application', applicationSchema); 