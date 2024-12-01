const express = require('express');
const router = express.Router();
const { createProperty, updateProperty, getBrokerProperties, searchProperties } = require('../controllers/propertyController');
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

// Get broker's properties - Private (Broker only)
router.get('/broker',
    auth,
    async (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    getBrokerProperties
);

// Add this route for searching properties
router.get('/search', searchProperties);

module.exports = router; 