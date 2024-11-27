const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    borough: {
        type: String,
        required: true,
        enum: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
    },
    neighborhoods: [{
        type: String,
        required: true
    }]
});

module.exports = mongoose.model('Location', locationSchema); 