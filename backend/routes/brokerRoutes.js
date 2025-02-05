const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');

// Search brokers
router.get('/search', brokerController.searchBrokers);

module.exports = router; 