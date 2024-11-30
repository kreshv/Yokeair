const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['building', 'unit'],
        required: true
    }
});

module.exports = mongoose.model('Amenity', amenitySchema); 