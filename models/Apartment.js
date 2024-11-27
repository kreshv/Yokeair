const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
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
        enum: ['studio', '1BR', '2BR', '3BR', '4BR+'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available'
    },
    price: {
        type: Number,
        required: true
    },
    squareFootage: {
        type: Number,
        required: true
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
        ref: 'Amenity'
    }],
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Apartment', apartmentSchema); 