const User = require('../models/User');
const Property = require('../models/Property');
const bcrypt = require('bcryptjs');
const { validatePassword } = require('../utils/passwordValidator');

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

exports.getSavedListings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const listings = await Property.find({
            _id: { $in: user.savedListings }
        })
        .populate({
            path: 'building',
            select: 'address amenities',
            populate: {
                path: 'amenities'
            }
        })
        .populate('features');

        res.json(listings);
    } catch (error) {
        console.error('Error getting saved listings:', error);
        res.status(500).json({ message: 'Error getting saved listings' });
    }
};

exports.saveListing = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const property = await Property.findById(req.params.propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (user.savedListings.includes(req.params.propertyId)) {
            return res.status(400).json({ message: 'Property already saved' });
        }

        user.savedListings.push(req.params.propertyId);
        await user.save();

        res.json({ message: 'Property saved successfully' });
    } catch (error) {
        console.error('Error saving listing:', error);
        res.status(500).json({ message: 'Error saving listing' });
    }
};

exports.removeSavedListing = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.savedListings = user.savedListings.filter(
            id => id.toString() !== req.params.propertyId
        );
        await user.save();

        res.json({ message: 'Property removed from saved listings' });
    } catch (error) {
        console.error('Error removing saved listing:', error);
        res.status(500).json({ message: 'Error removing saved listing' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        });

        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'New password does not meet requirements',
                errors: passwordValidation.errors 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
}; 