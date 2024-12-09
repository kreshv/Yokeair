const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { createProperty, updateProperty, getBrokerProperties, searchProperties, updatePropertyStatus, deleteProperty, uploadImages, bulkDeleteProperties } = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const { validateProperty, checkValidation } = require('../middleware/validation');
const { upload } = require('../config/cloudinary');

// Create property - Private (Broker only)
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

// Search properties - Public
router.get('/search', searchProperties);

// Bulk delete - Private (Broker only)
router.post('/bulk-delete', 
    auth,
    async (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    bulkDeleteProperties
);

// All routes below this point use URL parameters

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

// Update property - Private (Broker only)
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

// Delete property(ies) - Private (Broker only)
router.delete('/:id', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }

    // If id is "bulk", handle bulk deletion
    if (req.params.id === 'bulk') {
        return bulkDeleteProperties(req, res);
    }

    // Otherwise, handle single property deletion
    next();
}, deleteProperty);

// Upload images - Private (Broker only)
router.post('/:id/images', 
    auth,
    (req, res, next) => {
        if (req.user.role !== 'broker') {
            return res.status(403).json({ message: 'Access denied. Broker only.' });
        }
        next();
    },
    (req, res, next) => {
        upload.array('image', 20)(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({ 
                        message: 'Maximum 20 images allowed per upload' 
                    });
                }
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ 
                        message: 'One or more images exceed the size limit of 5MB' 
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ 
                        message: 'Too many files. Maximum 20 images allowed' 
                    });
                }
                return res.status(500).json({ 
                    message: 'Image upload failed', 
                    error: err.message 
                });
            }
            next();
        });
    },
    uploadImages
);

module.exports = router; 