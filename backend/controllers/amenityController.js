const Amenity = require('../models/Amenity');

// Get all amenities
exports.getAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.find();
        res.json(amenities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new amenity
exports.createAmenity = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newAmenity = new Amenity({ name, description });
        await newAmenity.save();
        res.status(201).json(newAmenity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 