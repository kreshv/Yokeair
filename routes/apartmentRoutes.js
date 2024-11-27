const express = require('express');
const router = express.Router();
const Apartment = require('../models/Apartment');
const { body, validationResult } = require('express-validator');
const {
    getApartments,
    searchApartments,
} = require('../controllers/apartmentController');

// Sample route for getting all apartments
router.get('/', (req, res) => {
    res.json({ message: 'List of apartments' });
});

// Sample route for creating a new apartment
router.post(
    '/',
    [
        body('building').isMongoId().withMessage('Building ID must be a valid MongoDB ID'),
        body('unitNumber').notEmpty().withMessage('Unit number is required'),
        body('type').isIn(['studio', '1BR', '2BR', '3BR', '4BR+']).withMessage('Type must be one of the following: studio, 1BR, 2BR, 3BR, 4BR+'),
        body('status').isIn(['available', 'rented', 'maintenance']).withMessage('Status must be one of the following: available, rented, maintenance'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('squareFootage').isNumeric().withMessage('Square footage must be a number'),
        body('bedrooms').isNumeric().withMessage('Number of bedrooms must be a number'),
        body('bathrooms').isNumeric().withMessage('Number of bathrooms must be a number'),
        body('features').isArray().withMessage('Features must be an array'),
        body('images').isArray().withMessage('Images must be an array')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const newApartment = new Apartment(req.body);
            await newApartment.save();
            res.status(201).json({ message: 'Apartment created', apartment: newApartment });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Sample route for getting apartments by building ID
router.get('/building/:buildingId', async (req, res) => {
    try {
        const apartments = await Apartment.find({ building: req.params.buildingId });
        res.json(apartments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update apartment by ID
router.put(
    '/:id',
    [
        body('building').optional().isMongoId().withMessage('Building ID must be a valid MongoDB ID'),
        body('unitNumber').optional().notEmpty().withMessage('Unit number is required'),
        body('type').optional().isIn(['studio', '1BR', '2BR', '3BR', '4BR+']).withMessage('Type must be one of the following: studio, 1BR, 2BR, 3BR, 4BR+'),
        body('status').optional().isIn(['available', 'rented', 'maintenance']).withMessage('Status must be one of the following: available, rented, maintenance'),
        body('price').optional().isNumeric().withMessage('Price must be a number'),
        body('squareFootage').optional().isNumeric().withMessage('Square footage must be a number'),
        body('bedrooms').optional().isNumeric().withMessage('Number of bedrooms must be a number'),
        body('bathrooms').optional().isNumeric().withMessage('Number of bathrooms must be a number'),
        body('features').optional().isArray().withMessage('Features must be an array'),
        body('images').optional().isArray().withMessage('Images must be an array')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const updatedApartment = await Apartment.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedApartment) {
                return res.status(404).json({ message: 'Apartment not found' });
            }
            res.json({ message: 'Apartment updated', apartment: updatedApartment });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Delete apartment by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedApartment = await Apartment.findByIdAndDelete(req.params.id);
        if (!deletedApartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        res.json({ message: 'Apartment deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Search apartments
router.get('/search', searchApartments);

// ... add more routes as needed

module.exports = router;