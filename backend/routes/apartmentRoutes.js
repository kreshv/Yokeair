const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
    getApartments,
    getApartment,
    createApartment,
    updateApartment,
    deleteApartment
} = require('../controllers/apartmentController');

// Validation middleware
const apartmentValidation = [
    body('building').notEmpty().withMessage('Building is required'),
    body('unitNumber').notEmpty().withMessage('Unit number is required'),
    body('type').isIn(['studio', '1BR', '2BR', '3BR', '4BR+']).withMessage('Invalid apartment type'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('squareFootage').isNumeric().withMessage('Square footage must be a number'),
    body('bedrooms').isNumeric().withMessage('Number of bedrooms must be a number'),
    body('bathrooms').isNumeric().withMessage('Number of bathrooms must be a number'),
    body('borough').notEmpty().withMessage('Borough is required'),
    body('neighborhood').notEmpty().withMessage('Neighborhood is required')
];

// @route   GET /api/apartments
// @desc    Get all apartments
// @access  Public
router.get('/', getApartments);

// @route   GET /api/apartments/:id
// @desc    Get single apartment
// @access  Public
router.get('/:id', getApartment);

// @route   POST /api/apartments
// @desc    Create new apartment
// @access  Private (Broker only)
router.post('/', [auth, ...apartmentValidation], createApartment);

// @route   PUT /api/apartments/:id
// @desc    Update apartment
// @access  Private (Broker only)
router.put('/:id', [auth, ...apartmentValidation], updateApartment);

// @route   DELETE /api/apartments/:id
// @desc    Delete apartment
// @access  Private (Broker only)
router.delete('/:id', auth, deleteApartment);

module.exports = router;