const User = require('../models/User');

// Search brokers
exports.searchBrokers = async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        console.log('Searching brokers with query:', search);

        // Create a case-insensitive regex for the search term
        const searchRegex = new RegExp(search, 'i');

        // Find brokers that match the search criteria
        const brokers = await User.find({
            role: 'broker',
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ]
        })
        .select('-password') // Exclude password from results
        .sort({ firstName: 1, lastName: 1 }); // Sort by name

        console.log(`Found ${brokers.length} brokers for search: ${search}`);
        res.json(brokers);
    } catch (error) {
        console.error('Broker search error:', error);
        res.status(500).json({ message: 'Error searching brokers' });
    }
}; 