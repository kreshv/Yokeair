const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Unit Feature']
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

// Seed initial features if they don't exist
featureSchema.statics.seedFeatures = async function() {
    const features = [
        { name: 'Balcony', category: 'Unit Feature' },
        { name: 'Terrace', category: 'Unit Feature' },
        { name: 'Backyard', category: 'Unit Feature' },
        { name: 'Dishwasher', category: 'Unit Feature' },
        { name: 'Washer/Dryer', category: 'Unit Feature' }
    ];

    try {
        for (let feature of features) {
            await this.findOneAndUpdate(
                { name: feature.name }, 
                feature, 
                { upsert: true, new: true }
            );
        }
        console.log('Features seeded successfully');
    } catch (error) {
        console.error('Error seeding features:', error);
    }
};

module.exports = mongoose.model('Feature', featureSchema); 