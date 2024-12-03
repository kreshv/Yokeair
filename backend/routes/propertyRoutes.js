const express = require('express');
const router = express.Router();
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

// Search properties
router.get('/search', searchProperties);

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