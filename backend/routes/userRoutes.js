const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { deleteImage } = require('../utils/cloudinary');
const url = require('url');
const path = require('path');
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

// Delete user account - Private
router.delete('/account', auth, async (req, res) => {
    try {
        // Find the user
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete Cloudinary profile picture if exists
        if (user.profilePicture) {
            try {
                // Parse the URL
                const parsedUrl = url.parse(user.profilePicture);
                
                // Extract the path and remove leading slash
                const pathParts = parsedUrl.pathname ? parsedUrl.pathname.split('/') : [];
                
                // Find the upload segment and get the public ID
                const uploadIndex = pathParts.indexOf('upload');
                let publicId;
                
                if (uploadIndex !== -1 && pathParts.length > uploadIndex + 2) {
                    // Cloudinary URL format: /upload/v1234/folder/imagename
                    publicId = pathParts.slice(uploadIndex + 2).join('/').split('.')[0];
                } else {
                    // Fallback: use basename without extension
                    publicId = path.basename(user.profilePicture, path.extname(user.profilePicture));
                }

                console.log('Attempting to delete Cloudinary image with public ID:', publicId);
                
                // Delete the image
                await deleteImage(publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting Cloudinary image:', cloudinaryError);
                // Continue with user deletion even if image deletion fails
            }
        }

        // Delete the user
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Account Deletion Error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router; 