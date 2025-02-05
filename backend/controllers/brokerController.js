const Broker = require('../models/broker');

// Search brokers
exports.searchBrokers = async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search) {
            return res.json([]);
        }

        const searchRegex = new RegExp(search, 'i');
        
        const brokers = await Broker.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { brokerage: searchRegex }
            ]
        });

        res.json(brokers);
    } catch (error) {
        console.error('Broker search error:', error);
        res.status(500).json({ message: 'Error searching brokers' });
    }
}; 