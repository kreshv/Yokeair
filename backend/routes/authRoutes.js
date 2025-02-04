const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    sendVerificationEmail,
    verifyEmail,
    requestPasswordReset,
    resetPassword
} = require('../controllers/authController');
const { validateRegistration, checkValidation } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validatePassword } = require('../utils/passwordValidator');

// Register route - Public
router.post('/register', validateRegistration, checkValidation, registerUser);

// Login route - Public
router.post('/login', loginUser);

// Get current user - Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Check email availability - Public
router.get('/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        res.json({ isAvailable: !user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Email verification routes
router.post('/send-verification', protect, sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Change password route - Private
router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'Password validation failed',
                errors: passwordValidation.errors 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

module.exports = router; 