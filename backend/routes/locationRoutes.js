const express = require('express');
const router = express.Router();
const { getBoroughs, getNeighborhoods } = require('../controllers/locationController');

// Get all boroughs with their neighborhoods
router.get('/boroughs', getBoroughs);

// Get neighborhoods by borough
router.get('/neighborhoods/:borough', getNeighborhoods);

module.exports = router; 