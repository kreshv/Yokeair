const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { 
  getSavedListings, 
  saveListing, 
  removeSavedListing 
} = require('../controllers/userController');

// Update user profile - Private
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Incoming User Role:', req.user.role);
        console.log('Incoming Update Data:', req.body);

        const { firstName, lastName, email, phone } = req.body;

        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Enforce role-based restrictions
        if (user.role === 'broker') {
            // Brokers can only update phone
            user.phone = phone;
        } else if (user.role === 'client') {
            // Clients can update firstName, lastName, and phone
            user.firstName = firstName;
            user.lastName = lastName;
            user.phone = phone;
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error('Profile Update Error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user profile picture - Private
router.put('/profile-picture', auth, async (req, res) => {
    try {
        const { profilePicture } = req.body;

        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile picture
        user.profilePicture = profilePicture;
        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json({
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture
        });
    } catch (err) {
        console.error('Profile Picture Update Error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get saved listings - Private
router.get('/saved-listings', auth, getSavedListings);

// Save a listing - Private
router.post('/saved-listings/:propertyId', auth, saveListing);

// Remove a saved listing - Private
router.delete('/saved-listings/:propertyId', auth, removeSavedListing);

module.exports = router; 