const express = require('express');
const router = express.Router();
const { searchBrokers } = require('../controllers/brokerController');

// Search brokers
router.get('/search', searchBrokers);

module.exports = router; 