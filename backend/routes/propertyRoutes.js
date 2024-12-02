const express = require('express');
const router = express.Router();
const { createProperty, updateProperty, getBrokerProperties, searchProperties, updatePropertyStatus, deleteProperty } = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const { validateProperty, checkValidation } = require('../middleware/validation');
const { upload } = require('../config/cloudinary');
const Property = require('../models/Property');

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

// Update property status - Private (Broker only)
router.patch('/:id/status', auth, updatePropertyStatus);

// Delete property - Private (Broker only)
router.delete('/:id', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, deleteProperty);

// Add this route for uploading images
router.post('/:id/images', 
    auth,
    upload.array('images', 10), // Allow up to 10 images
    async (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    async (req, res) => {
        try {
            const property = await Property.findById(req.params.id);
            
            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }

            if (property.broker.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            const images = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));

            property.images = property.images.concat(images);
            await property.save();

            res.json(property);
        } catch (error) {
            console.error('Error uploading images:', error);
            res.status(500).json({ message: 'Error uploading images' });
        }
    }
);

module.exports = router; 