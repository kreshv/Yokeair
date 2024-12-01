const Location = require('../models/Location');

// Get all boroughs
exports.getBoroughs = async (req, res) => {
    try {
        const locations = await Location.find().select('borough neighborhoods');
        res.json(locations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get neighborhoods by borough
exports.getNeighborhoods = async (req, res) => {
    try {
        const location = await Location.findOne({ borough: req.params.borough });
        if (!location) {
            return res.status(404).json({ message: 'Borough not found' });
        }
        res.json(location.neighborhoods);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 