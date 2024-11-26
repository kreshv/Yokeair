const express = require('express');
const router = express.Router();
const {
    getBuildings,
    getBuilding,
    createBuilding,
    updateBuilding
} = require('../controllers/buildingController');
const auth = require('../middleware/auth');

// Get all buildings - Public
router.get('/', getBuildings);

// Get single building - Public
router.get('/:id', getBuilding);

// Create building - Private (Broker only)
router.post('/', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, createBuilding);

// Update building - Private (Broker only)
router.put('/:id', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, updateBuilding);

module.exports = router; 