const express = require('express');
const router = express.Router();
const Feature = require('../models/Feature');

// @route   GET /api/features/unit
// @desc    Get all unit features
// @access  Public
router.get('/unit', async (req, res) => {
    console.log('GET /api/features/unit endpoint hit');
    try {
        const unitFeatures = await Feature.find({ category: 'Unit Feature' });
        console.log('Found unit features:', unitFeatures);
        res.json(unitFeatures);
    } catch (err) {
        console.error('Error in /api/features/unit:', err.message);
        res.status(500).send('Server Error');
    }
});

// Add a test route to verify the router is mounted
router.get('/test', (req, res) => {
    console.log('Features test route hit');
    res.json({ message: 'Features router is working' });
});

module.exports = router; 