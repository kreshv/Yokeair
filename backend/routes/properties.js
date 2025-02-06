const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Building = require('../models/Building');

// ... existing imports and middleware ...

// Search properties
router.get('/search', async (req, res) => {
    try {
        console.log('Received search request:', req.query);
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
        const query = { status: 'available' };

        // Text search conditions
        if (search && typeof search === 'string') {
            const searchPattern = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            query.$or = [
                { 'building.address.street': { $regex: searchPattern, $options: 'i' } },
                { 'building.address.city': { $regex: searchPattern, $options: 'i' } },
                { borough: { $regex: searchPattern, $options: 'i' } },
                { neighborhood: { $regex: searchPattern, $options: 'i' } },
                { unitNumber: { $regex: searchPattern, $options: 'i' } }
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
            
            query['building'] = {
                $in: buildingsWithAmenities.map(b => b._id)
            };
        }
        
        if (features) {
            const featureList = features.split(',');
            query.features = { $all: featureList };
        }

        console.log('Search query:', JSON.stringify(query, null, 2));

        // Execute the query with proper population
        const properties = await Property.find(query)
            .populate({
                path: 'building',
                select: 'name address amenities broker images',
                populate: {
                    path: 'amenities broker',
                    select: 'name type firstName lastName email phone'
                }
            })
            .populate('features', 'name type')
            .lean();

        console.log(`Found ${properties.length} properties matching the search criteria`);
        
        res.json(properties);
    } catch (error) {
        console.error('Property search error:', error);
        res.status(500).json({ 
            message: 'Error searching properties',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ... existing routes ...

module.exports = router; 