const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Amenity', 'Unit Feature', 'Building Feature'],
        default: 'Unit Feature'
    }
}, {
    timestamps: true
});

// Seed initial features if they don't exist
FeatureSchema.statics.seedFeatures = async function() {
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

const Feature = mongoose.model('Feature', FeatureSchema);

module.exports = Feature; 