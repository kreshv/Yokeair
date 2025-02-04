const express = require('express');
const router = express.Router();
const { auth, checkBrokerRole } = require('../middleware/auth');
const { createProperty, updateProperty, getBrokerProperties, searchProperties, bulkDeleteProperties, getProperty, deleteProperty } = require('../controllers/propertyController');
const { upload } = require('../config/cloudinary');
const Property = require('../models/Property');

// Public routes
router.get('/search', searchProperties);

// Protected routes
router.use(auth);

// Broker-only routes
router.route('/')
    .post(checkBrokerRole, upload.array('images', 10), createProperty)
    .get(checkBrokerRole, getBrokerProperties);

router.route('/:id')
    .get(getProperty)
    .put(checkBrokerRole, updateProperty)
    .delete(checkBrokerRole, deleteProperty);

// Add image upload route
router.post('/:id/images', checkBrokerRole, upload.array('image', 15), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;
        
        console.log('Image upload request for property:', id);
        console.log('Files received:', files?.length);
        
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Log file details
        files.forEach((file, index) => {
            console.log(`File ${index + 1}:`, {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                location: file.location
            });
        });

        // Format image data according to schema
        const imageData = files.map(file => ({
            url: file.path || file.location,
            public_id: file.filename || file.key || file.public_id || file.path.split('/').pop()
        }));

        console.log('Formatted image data:', imageData);

        // Update the property with the new image data
        const property = await Property.findByIdAndUpdate(
            id,
            { $push: { images: { $each: imageData } } },
            { new: true }
        );

        if (!property) {
            console.error('Property not found:', id);
            return res.status(404).json({ message: 'Property not found' });
        }

        console.log('Property updated successfully with new images');

        res.json({ 
            success: true, 
            message: 'Images uploaded successfully',
            images: imageData
        });
    } catch (error) {
        console.error('Error in image upload:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Error uploading images',
            error: error.message 
        });
    }
});

router.delete('/bulk', checkBrokerRole, bulkDeleteProperties);

module.exports = router; 