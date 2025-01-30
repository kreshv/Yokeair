const express = require('express');
const router = express.Router();
const {
    getBuildings,
    getBuilding,
    createBuilding,
    updateBuilding
} = require('../controllers/buildingController');
const { auth, checkBrokerRole } = require('../middleware/auth');

// Get all buildings - Public
router.get('/', getBuildings);

// Get single building - Public
router.get('/:id', getBuilding);

// Create building - Private (Broker only)
router.post('/', auth, checkBrokerRole, createBuilding);

// Update building - Private (Broker only)
router.put('/:id', auth, checkBrokerRole, updateBuilding);

module.exports = router; 