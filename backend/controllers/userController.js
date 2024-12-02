const User = require('../models/User');
const Property = require('../models/Property');

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
        const user = await User.findById(req.user.id).populate({
            path: 'savedListings',
            populate: {
                path: 'building',
                select: 'address amenities'
            }
        });

        res.json(user.savedListings);
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