const express = require('express');
const router = express.Router();
const { getBoroughs, getNeighborhoods } = require('../controllers/locationController');

// Get all boroughs
router.get('/boroughs', getBoroughs);

// Get neighborhoods by borough
router.get('/neighborhoods/:borough', getNeighborhoods);

module.exports = router; 