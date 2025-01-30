const express = require('express');
const router = express.Router();
const { auth, checkBrokerRole, checkClientRole } = require('../middleware/auth');
const { 
    submitApplication,
    getUserApplications,
    getBrokerApplications,
    getApplicationById,
    updateApplicationStatus,
    uploadDocument
} = require('../controllers/applicationController');
const upload = require('../middleware/upload');

// Submit new application - Private (Client only)
router.post('/', auth, checkClientRole, submitApplication);

// Get user's applications - Private (Client)
router.get('/my-applications', auth, checkClientRole, getUserApplications);

// Get applications for broker's properties - Private (Broker only)
router.get('/broker-applications', auth, checkBrokerRole, getBrokerApplications);

// Get application by ID - Private
router.get('/:id', auth, getApplicationById);

// Update application status - Private (Broker only)
router.patch('/:id/status', auth, checkBrokerRole, updateApplicationStatus);

// Upload document - Private (Client only)
router.post('/:id/documents', 
    auth, 
    checkClientRole,
    upload.single('document'),
    uploadDocument
);

module.exports = router; 