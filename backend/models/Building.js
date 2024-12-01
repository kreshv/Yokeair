const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        borough: {
            type: String,
            required: true
        },
        neighborhood: {
            type: String,
            required: true
        }
    },
    amenities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity'
    }],
    broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Building', buildingSchema); 