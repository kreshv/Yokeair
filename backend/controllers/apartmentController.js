const Apartment = require('../models/Apartment');
const { validationResult } = require('express-validator');

// @desc    Get all apartments
// @route   GET /api/apartments
// @access  Public
exports.getApartments = async (req, res) => {
    try {
        const { 
            minPrice, 
            maxPrice, 
            bedrooms, 
            borough,
            neighborhood,
            page = 1,
            limit = 9
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        if (bedrooms) {
            filter.bedrooms = Number(bedrooms);
        }

        if (borough) {
            filter.borough = borough;
        }

        if (neighborhood) {
            filter.neighborhood = neighborhood;
        }

        // Only show available apartments
        filter.status = 'available';

        const skip = (page - 1) * limit;

        const [apartments, total] = await Promise.all([
            Apartment.find(filter)
                .populate('building', 'name address')
                .populate('features', 'name')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            Apartment.countDocuments(filter)
        ]);

        res.json({
            apartments,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single apartment
// @route   GET /api/apartments/:id
// @access  Public
exports.getApartment = async (req, res) => {
    try {
        const apartment = await Apartment.findById(req.params.id)
            .populate('building', 'name address amenities')
            .populate('features', 'name description');

        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        res.json(apartment);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new apartment
// @route   POST /api/apartments
// @access  Private (Broker only)
exports.createApartment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if user is a broker
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Not authorized to create apartments' });
        }

        const newApartment = new Apartment({
            ...req.body,
            status: 'available'
        });

        const apartment = await newApartment.save();
        res.status(201).json(apartment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update apartment
// @route   PUT /api/apartments/:id
// @access  Private (Broker only)
exports.updateApartment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if user is a broker
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Not authorized to update apartments' });
        }

        const apartment = await Apartment.findById(req.params.id);

        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            apartment[key] = req.body[key];
        });

        await apartment.save();
        res.json(apartment);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete apartment
// @route   DELETE /api/apartments/:id
// @access  Private (Broker only)
exports.deleteApartment = async (req, res) => {
    try {
        // Check if user is a broker
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Not authorized to delete apartments' });
        }

        const apartment = await Apartment.findById(req.params.id);

        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        await apartment.deleteOne();
        res.json({ message: 'Apartment removed' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};