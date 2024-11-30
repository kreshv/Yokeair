const express = require('express');
const router = express.Router();
const { getAmenities, createAmenity } = require('../controllers/amenityController');

// Get all amenities
router.get('/', getAmenities);

// Create a new amenity
router.post('/', createAmenity);

module.exports = router; 