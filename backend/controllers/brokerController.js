const User = require('../models/User');

// Search brokers
exports.searchBrokers = async (req, res) => {
    try {
        const { search } = req.query;
        
        let query = {
            role: 'broker' // Only search for users with broker role
        };
        
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        const brokers = await User.find(query)
            .select('-password') // Exclude password field
            .sort({ firstName: 1, lastName: 1 });
            
        res.json({ data: brokers });
    } catch (error) {
        console.error('Broker search error:', error);
        res.status(500).json({ message: 'Error searching brokers' });
    }
}; 