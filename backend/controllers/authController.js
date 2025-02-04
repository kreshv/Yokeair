const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/passwordValidator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Verify Your Email - YokeAir',
        html: `
            <h1>Welcome to YokeAir!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Password Reset Request - YokeAir',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

exports.registerUser = async (req, res) => {
    try {
        console.log('Registration attempt:', {
            ...req.body,
            password: '[REDACTED]'
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

        // Create new user
        user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            password,
            role: role || 'client'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log('User saved successfully:', { userId: user._id });

        // Create JWT token
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

        try {
            const token = await new Promise((resolve, reject) => {
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: '5h' },
                    (err, token) => {
                        if (err) reject(err);
                        else resolve(token);
                    }
                );
            });

            console.log('JWT created successfully for new user');
            
            return res.json({ 
                token,
                user: payload.user
            });
        } catch (jwtError) {
            console.error('JWT Creation Error:', {
                error: jwtError,
                secret: process.env.JWT_SECRET ? 'Secret exists' : 'No secret found'
            });
            return res.status(500).json({
                message: 'Error creating authentication token',
                error: 'JWT creation failed'
            });
        }
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

        // Create JWT token
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

        // Use Promise-based JWT sign
        try {
            const token = await new Promise((resolve, reject) => {
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: '5h' },
                    (err, token) => {
                        if (err) reject(err);
                        else resolve(token);
                    }
                );
            });

            console.log('JWT created successfully');
            
            return res.json({ 
                token,
                user: payload.user
            });
        } catch (jwtError) {
            console.error('JWT Creation Error:', {
                error: jwtError,
                secret: process.env.JWT_SECRET ? 'Secret exists' : 'No secret found'
            });
            return res.status(500).json({
                message: 'Error creating authentication token',
                error: 'JWT creation failed'
            });
        }
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

// Send verification email
exports.sendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const token = generateToken();
        user.emailVerificationToken = token;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        await sendVerificationEmail(user, token);
        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ message: 'Error sending verification email' });
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if a reset token was generated in the last minute
        if (user.passwordResetExpires && user.passwordResetExpires > Date.now() - 60000) {
            return res.status(429).json({ 
                message: 'Please wait a minute before requesting another reset email' 
            });
        }

        const token = generateToken();
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(user, token);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ message: 'Error requesting password reset' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'Password validation failed',
                errors: passwordValidation.errors 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};