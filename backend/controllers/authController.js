const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordValidator');

exports.registerUser = async (req, res) => {
    try {
        console.log('Registration attempt:', {
            ...req.body,
            password: '[REDACTED]' // Don't log the actual password
        });

        const { firstName, lastName, email, password, phone, role } = req.body;

        // Validate password
        const passwordValidation = validatePassword(password, { 
            firstName, lastName, email, phone 
        });

        console.log('Password validation result:', passwordValidation);

        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'Password validation failed',
                errors: passwordValidation.errors 
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        console.log('Existing user check:', { exists: !!user });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with explicit role
        user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            password,
            role: role || 'client' // Default to client if role is not specified
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log('User saved successfully:', { userId: user._id });

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Sign error:', err);
                    throw err;
                }
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Registration error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({ 
            message: 'Server error during registration',
            error: err.message 
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        console.log('Login attempt:', {
            email: req.body.email,
            hasPassword: !!req.body.password
        });

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        console.log('User found:', { exists: !!user });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture || null
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Sign error:', err);
                    throw err;
                }
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        profilePicture: user.profilePicture || null
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({
            message: 'Server error during login',
            error: err.message
        });
    }
}; 