const Property = require('../models/Property');
const Building = require('../models/Building');

exports.createProperty = async (req, res) => {
    try {
        console.log('Received property data:', req.body);

        const {
            address,
            borough,
            neighborhood,
            unitNumber,
            bedrooms,
            bathrooms,
            price,
            buildingAmenities,
            unitFeatures,
            broker
        } = req.body;

        // Validate required fields
        const requiredFields = {
            address,
            borough,
            neighborhood,
            unitNumber,
            bedrooms,
            bathrooms,
            price,
            broker
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value && value !== 0)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields,
                receivedData: req.body
            });
        }

        // Create or find building
        let building = await Building.findOne({
            'address.street': address,
            'address.borough': borough
        });

        if (!building) {
            building = await Building.create({
                name: address,
                address: {
                    street: address,
                    borough: borough,
                    neighborhood: neighborhood
                },
                amenities: buildingAmenities || [],
                broker
            });
        }

        // Parse numeric values
        const parsedBedrooms = parseInt(bedrooms);
        const parsedBathrooms = parseFloat(bathrooms);
        const parsedPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));

        // Check for existing unit in the building
        const existingUnit = await Property.findOne({
            building: building._id,
            unitNumber: unitNumber
        });

        if (existingUnit) {
            return res.status(400).json({
                message: 'Unit already exists in this building'
            });
        }

        const property = await Property.create({
            building: building._id,
            unitNumber,
            type: parsedBedrooms === 0 ? 'studio' : `${parsedBedrooms}BR`,
            status: 'available',
            price: parsedPrice,
            bedrooms: parsedBedrooms,
            bathrooms: parsedBathrooms,
            features: unitFeatures || [],
            broker
        });

        await property.populate('building features');
        
        res.status(201).json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({
            message: 'Error creating property listing',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        console.log('Update request received:', {
            propertyId: req.params.id,
            body: req.body,
            userId: req.user.id
        });

        const { buildingAmenities, unitFeatures } = req.body;
        const propertyId = req.params.id;

        // Find the property
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user is the broker of this property
        if (property.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        // Update building amenities if provided
        if (buildingAmenities && buildingAmenities.length > 0) {
            const building = await Building.findById(property.building);
            if (building) {
                building.amenities = buildingAmenities;
                await building.save();
            }
        }

        // Update property features
        if (unitFeatures) {
            property.features = unitFeatures;
            await property.save();
        }

        // Populate the updated property
        await property.populate('building features');

        res.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({
            message: 'Error updating property',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 