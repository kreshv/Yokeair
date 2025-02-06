const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Building = require('../models/Building');

// ... existing imports and middleware ...

// Search properties
router.get('/search', async (req, res) => {
    try {
        const {
            search,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            amenities,
            features,
            neighborhoods,
            boroughs
        } = req.query;

        // Build the query object
        const query = {};

        // Text search conditions
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { 'building.address.street': searchRegex },
                { 'building.address.city': searchRegex },
                { borough: searchRegex },
                { neighborhood: searchRegex },
                { unitNumber: searchRegex }
            ];
        }

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Bedrooms and bathrooms
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);

        // Neighborhoods and boroughs
        if (neighborhoods) {
            const neighborhoodList = neighborhoods.split(',');
            query.neighborhood = { $in: neighborhoodList };
        }
        if (boroughs) {
            const boroughList = boroughs.split(',');
            query.borough = { $in: boroughList };
        }

        // Amenities and features
        if (amenities) {
            const amenityList = amenities.split(',');
            // First, find buildings with these amenities
            const buildingsWithAmenities = await Building.find({
                'amenities': { $all: amenityList }
            }).select('_id');
            
            query.building = {
                $in: buildingsWithAmenities.map(b => b._id)
            };
        }
        
        if (features) {
            const featureList = features.split(',');
            query.features = { $all: featureList };
        }

        console.log('Search query:', JSON.stringify(query, null, 2));

        // Execute the query with proper population and error handling
        const properties = await Property.find(query)
            .populate({
                path: 'building',
                select: 'name address amenities broker',
                populate: {
                    path: 'amenities',
                    select: 'name type'
                }
            })
            .populate('features', 'name type')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // Filter out any properties with null references
        const validProperties = properties.filter(prop => 
            prop.building && 
            prop.building.address
        );

        console.log(`Found ${validProperties.length} valid properties out of ${properties.length} total`);
        
        res.json(validProperties);
    } catch (error) {
        console.error('Property search error:', error);
        res.status(500).json({ 
            message: 'Error searching properties',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ... existing routes ...

module.exports = router; 