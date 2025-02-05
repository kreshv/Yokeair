const User = require('../models/User');

// Search brokers
exports.searchBrokers = async (req, res) => {
    try {
        const { search } = req.query;
        
        console.log('Broker search query:', req.query);

        let query = { role: 'broker' };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
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
            ];
        }

        console.log('Final broker search query:', JSON.stringify(query, null, 2));

        // Find brokers that match the search criteria
        const brokers = await User.find(query)
            .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires') // Exclude sensitive fields
            .sort({ firstName: 1, lastName: 1 }); // Sort by name

        console.log(`Found ${brokers.length} brokers for search: ${search || 'no search term'}`);
        
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