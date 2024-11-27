const Building = require('../models/Building');
const Amenity = require('../models/Amenity');

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find()
            .populate('broker', 'name email')
            .populate('amenities')
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
            .populate('broker', 'name email')
            .populate('amenities');
        
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        res.json(building);
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

        // Validate amenities if provided
        if (amenities && amenities.length > 0) {
            // Verify all amenities exist and are of type 'building'
            const validAmenities = await Amenity.find({
                _id: { $in: amenities },
                type: 'building'
            });

            if (validAmenities.length !== amenities.length) {
                return res.status(400).json({ 
                    message: 'One or more amenities are invalid or not of type building' 
                });
            }
        }

        const building = new Building({
            name,
            address,
            description,
            amenities,
            broker: req.user.id // From auth middleware
        });

        await building.save();

        // Populate the response with amenities and broker info
        const populatedBuilding = await Building.findById(building._id)
            .populate('broker', 'name email')
            .populate('amenities');

        res.status(201).json(populatedBuilding);
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

        // Validate amenities if they're being updated
        if (req.body.amenities) {
            const validAmenities = await Amenity.find({
                _id: { $in: req.body.amenities },
                type: 'building'
            });

            if (validAmenities.length !== req.body.amenities.length) {
                return res.status(400).json({ 
                    message: 'One or more amenities are invalid or not of type building' 
                });
            }
        }

        const updatedBuilding = await Building.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('broker', 'name email')
         .populate('amenities');

        res.json(updatedBuilding);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 