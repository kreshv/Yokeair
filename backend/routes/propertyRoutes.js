const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { createProperty, updateProperty, getBrokerProperties, searchProperties, updatePropertyStatus, deleteProperty, uploadImages } = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const { validateProperty, checkValidation } = require('../middleware/validation');
const { upload } = require('../config/cloudinary');

// Routes
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

// Search properties
router.get('/search', searchProperties);

// Get single property - Public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('building')
            .populate('features');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(500).json({ message: 'Error fetching property' });
    }
});

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

// Update property status - Private (Broker only)
router.patch('/:id/status', auth, updatePropertyStatus);

// Delete property - Private (Broker only)
router.delete('/:id', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, deleteProperty);

// Upload images - Private (Broker only)
router.post('/:id/images', 
    auth,
    upload.array('images', 10),
    async (req, res, next) => {
        console.log('Auth middleware passed, user:', req.user.id);
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    uploadImages
);

module.exports = router; 