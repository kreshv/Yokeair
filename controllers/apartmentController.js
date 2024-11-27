const Apartment = require('../models/Apartment');

// Get all apartments with filters
exports.searchApartments = async (req, res) => {
    try {
        const {
            borough,
            neighborhood,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            features,
            buildingAmenities
        } = req.query;

        // Build query object
        const query = {};

        // Location filters
        if (borough) query.borough = borough;
        if (neighborhood) query.neighborhood = neighborhood;

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Room filters
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (bathrooms) query.bathrooms = Number(bathrooms);

        // Features filter
        if (features) {
            const featureIds = features.split(',');
            query.features = { $in: featureIds };
        }

        // Find apartments and populate necessary fields
        const apartments = await Apartment.find(query)
            .populate('building')
            .populate('features')
            .populate({
                path: 'building',
                populate: {
                    path: 'amenities'
                }
            });

        // Filter by building amenities if specified
        let filteredApartments = apartments;
        if (buildingAmenities) {
            const amenityIds = buildingAmenities.split(',');
            filteredApartments = apartments.filter(apt => 
                apt.building.amenities.some(amenity => 
                    amenityIds.includes(amenity._id.toString())
                )
            );
        }

        res.json(filteredApartments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create new apartment
exports.createApartment = async (req, res) => {
    try {
        const newApartment = new Apartment(req.body);
        await newApartment.save();
        
        const apartment = await Apartment.findById(newApartment._id)
            .populate('building')
            .populate('features')
            .populate({
                path: 'building',
                populate: {
                    path: 'amenities'
                }
            });

        res.status(201).json(apartment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 