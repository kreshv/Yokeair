const { check, validationResult } = require('express-validator');
const Property = require('../models/Property');

exports.validateProperty = [
    check('address')
        .notEmpty()
        .withMessage('Address is required')
        .trim(),
    
    check('borough')
        .notEmpty()
        .withMessage('Borough is required')
        .isIn(['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'])
        .withMessage('Invalid borough'),
    
    check('neighborhood')
        .notEmpty()
        .withMessage('Neighborhood is required')
        .trim(),
    
    check('unitNumber')
        .notEmpty()
        .withMessage('Unit number is required')
        .trim()
        .custom(async (value, { req }) => {
            try {
                const existingProperty = await Property.findOne({
                    'building.address.street': req.body.address,
                    'building.address.borough': req.body.borough,
                    unitNumber: value
                });
                
                if (existingProperty) {
                    throw new Error('This unit already exists in the building');
                }
                return true;
            } catch (error) {
                throw new Error(error.message);
            }
        }),
    
    check('bedrooms')
        .isInt({ min: 0, max: 4 })
        .withMessage('Bedrooms must be between 0 and 4'),
    
    check('bathrooms')
        .isFloat({ min: 1, max: 4 })
        .withMessage('Bathrooms must be between 1 and 4'),
    
    check('price')
        .notEmpty()
        .withMessage('Price is required')
        .custom((value) => {
            const price = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
            if (isNaN(price) || price <= 0) {
                throw new Error('Invalid price format');
            }
            return true;
        }),

    check('broker')
        .notEmpty()
        .withMessage('Broker ID is required')
];

exports.validateRegistration = [
    check('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .trim(),
    
    check('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .trim(),
    
    check('email')
        .isEmail()
        .withMessage('Please include a valid email')
        .normalizeEmail(),
    
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    check('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number')
];

// Middleware to check validation results
exports.checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}; 