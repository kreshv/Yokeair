const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const { searchBrokers } = require('../controllers/brokerController');

// GET /api/brokers/:brokerId/listings
router.get('/:brokerId/listings', async (req, res) => {
    try {
        const { brokerId } = req.params;

        // Find the broker
        const broker = await User.findOne({ _id: brokerId, role: 'broker' });
        if (!broker) {
            return res.status(404).json({ message: 'Broker not found' });
        }

        // Find all properties listed by this broker with populated building and features
        const properties = await Property.find({ broker: brokerId })
            .populate({
                path: 'building',
                populate: {
                    path: 'amenities',
                    model: 'Amenity'
                }
            })
            .populate('features')
            .sort({ createdAt: -1 });

        // Format the properties to include formatted address and amenity/feature names
        const formattedProperties = properties.map(property => {
            const formattedProperty = property.toObject();
            
            // Format address using building address
            formattedProperty.formattedAddress = `${property.building.address.street}, ${property.building.address.borough}`;
            
            // Format amenities and features as names instead of IDs
            formattedProperty.buildingAmenities = property.building.amenities.map(amenity => amenity.name);
            formattedProperty.propertyFeatures = property.features.map(feature => feature.name);

            // Add broker information to each property
            formattedProperty.broker = {
                _id: broker._id,
                firstName: broker.firstName,
                lastName: broker.lastName,
                email: broker.email,
                phone: broker.phone,
                profilePicture: broker.profilePicture
            };

            return formattedProperty;
        });

        // Return broker info and their properties
        res.json({
            firstName: broker.firstName,
            lastName: broker.lastName,
            email: broker.email,
            phone: broker.phone,
            profilePicture: broker.profilePicture,
            properties: formattedProperties
        });
    } catch (error) {
        console.error('Error fetching broker listings:', error);
        res.status(500).json({ message: 'Server error while fetching broker listings' });
    }
});

// Search brokers - Public
router.get('/search', searchBrokers);

module.exports = router; 