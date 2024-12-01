const express = require('express');
const router = express.Router();
const { createProperty, updateProperty } = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const { validateProperty, checkValidation } = require('../middleware/validation');

// Create new property - Private (Broker only)
router.post('/', 
    auth, 
    validateProperty,
    checkValidation,
    async (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    }, 
    createProperty
);

// Update property amenities - Private (Broker only)
router.patch('/:id',
    auth,
    async (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    updateProperty
);

module.exports = router; 