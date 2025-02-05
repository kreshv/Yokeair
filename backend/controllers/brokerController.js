const User = require('../models/User');

// Search brokers
exports.searchBrokers = async (req, res) => {
    try {
        const { search } = req.query;
        
        let query = {
            role: 'broker' // Only search for users with broker role
        };
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const brokers = await User.find(query)
            .select('-password') // Exclude password field
            .sort({ firstName: 1, lastName: 1 });
            
        res.json(brokers);
    } catch (error) {
        console.error('Error in searchBrokers:', error);
        res.status(500).json({ message: 'Error searching brokers', error: error.message });
    }
}; 