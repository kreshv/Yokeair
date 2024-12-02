const express = require('express');
const router = express.Router();
const { updateProfile, getSavedListings, saveListing, removeSavedListing } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Update user profile
router.patch('/profile', auth, updateProfile);

// Saved listings routes
router.get('/saved-listings', auth, getSavedListings);
router.post('/saved-listings/:propertyId', auth, saveListing);
router.delete('/saved-listings/:propertyId', auth, removeSavedListing);

module.exports = router; 