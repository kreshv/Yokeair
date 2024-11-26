const Building = require('../models/Building');
const Apartment = require('../models/Apartment');

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find()
            .populate('broker', 'name email')
            .sort({ createdAt: -1 });
        res.json(buildings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get single building with its apartments
exports.getBuilding = async (req, res) => {
    try {
        const building = await Building.findById(req.params.id)
            .populate('broker', 'name email');
        
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        // Get apartments for this building
        const apartments = await Apartment.find({ building: req.params.id });
        
        res.json({
            building,
            apartments
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create building (Broker only)
exports.createBuilding = async (req, res) => {
    try {
        const { name, address, description, amenities } = req.body;

        const building = new Building({
            name,
            address,
            description,
            amenities,
            broker: req.user.id
        });

        await building.save();
        res.json(building);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update building (Broker only)
exports.updateBuilding = async (req, res) => {
    try {
        const building = await Building.findById(req.params.id);

        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        // Make sure user is the broker for this building
        if (building.broker.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedBuilding = await Building.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedBuilding);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 