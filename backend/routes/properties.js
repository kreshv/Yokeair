const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Building = require('../models/Building');
const { searchProperties } = require('../controllers/propertyController');

// ... existing imports and middleware ...

// Search properties
router.get('/search', searchProperties);

// ... existing routes ...

module.exports = router; 