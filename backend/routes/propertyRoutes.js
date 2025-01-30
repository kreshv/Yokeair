const express = require('express');
const router = express.Router();
const { auth, checkBrokerRole } = require('../middleware/auth');
const { createProperty, updateProperty, getBrokerProperties, searchProperties, bulkDeleteProperties, getProperty } = require('../controllers/propertyController');
const { upload } = require('../config/cloudinary');

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
    .put(checkBrokerRole, updateProperty);

router.delete('/bulk', checkBrokerRole, bulkDeleteProperties);

module.exports = router; 