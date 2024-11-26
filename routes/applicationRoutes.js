const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
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
router.post('/', auth, async (req, res, next) => {
    if (req.user.role !== 'client') {
        return res.status(403).json({ message: 'Only clients can submit applications' });
    }
    next();
}, submitApplication);

// Get user's applications - Private (Client)
router.get('/my-applications', auth, getUserApplications);

// Get applications for broker's properties - Private (Broker only)
router.get('/broker-applications', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, getBrokerApplications);

// Get application by ID - Private
router.get('/:id', auth, getApplicationById);

// Update application status - Private (Broker only)
router.patch('/:id/status', auth, async (req, res, next) => {
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Access denied. Broker only.' });
    }
    next();
}, updateApplicationStatus);

// Upload document - Private (Client only)
router.post('/:id/documents', 
    auth, 
    async (req, res, next) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can upload documents' });
        }
        next();
    },
    upload.single('document'),
    uploadDocument
);

module.exports = router; 