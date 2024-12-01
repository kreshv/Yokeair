const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, isBroker } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Combine firstName and lastName into name
        const name = `${firstName} ${lastName}`.trim();

        // Create new user
        user = new User({
            name,
            email,
            password,
            phone,
            role: isBroker ? 'broker' : 'client'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                // Return both token and user data
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        role: user.role,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // Return both token and user data
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        role: user.role,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}; 