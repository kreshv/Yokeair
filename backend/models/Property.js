const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    public_id: String
});

const propertySchema = new mongoose.Schema({
    building: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    borough: {
        type: String,
        required: true
    },
    neighborhood: {
        type: String,
        required: true
    },
    unitNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['studio', '1BR', '2BR', '3BR', '4BR'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'in_contract', 'rented'],
        default: 'available'
    },
    price: {
        type: Number,
        required: true
    },
    squareFootage: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    features: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature'
    }],
    broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    images: {
        type: [imageSchema],
        default: []
    }
});

propertySchema.index({
    'building.address.street': 1,
    'building.address.borough': 1,
    unitNumber: 1
}, { unique: true });

propertySchema.index({ price: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ 'images.public_id': 1 });

propertySchema.methods.removeImages = function(publicIds) {
    this.images = this.images.filter(img => !publicIds.includes(img.public_id));
    return this.save();
};

module.exports = mongoose.model('Property', propertySchema); 