const router = express.Router();

// ... existing imports and middleware ...

// Search properties
router.get('/search', async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Create a case-insensitive regex for the search term
        const searchRegex = new RegExp(search, 'i');

        // Find properties that match the search criteria
        const properties = await Property.find({
            $or: [
                { 'building.address.street': searchRegex },
                { 'building.address.city': searchRegex },
                { borough: searchRegex },
                { neighborhood: searchRegex },
                { unitNumber: searchRegex }
            ]
        })
        .populate('building')
        .populate('features')
        .populate({
            path: 'building',
            populate: {
                path: 'amenities'
            }
        })
        .sort({ createdAt: -1 });

        res.json(properties);
    } catch (error) {
        console.error('Property search error:', error);
        res.status(500).json({ message: 'Error searching properties' });
    }
});

// ... existing routes ... 