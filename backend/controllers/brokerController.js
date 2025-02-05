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
                { email: searchRegex },
                // Add a combined name search
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ['$firstName', ' ', '$lastName'] },
                            regex: searchRegex
                        }
                    }
                }
            ]
        })
        .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires') // Exclude sensitive fields
        .sort({ firstName: 1, lastName: 1 }); // Sort by name

        console.log(`Found ${brokers.length} brokers for search: ${search}`);
        
        // Transform broker data for response
        const formattedBrokers = brokers.map(broker => ({
            _id: broker._id,
            firstName: broker.firstName,
            lastName: broker.lastName,
            email: broker.email,
            phone: broker.phone,
            profilePicture: broker.profilePicture,
            fullName: `${broker.firstName} ${broker.lastName}`
        }));

        res.json(formattedBrokers);
    } catch (error) {
        console.error('Broker search error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Error searching brokers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 