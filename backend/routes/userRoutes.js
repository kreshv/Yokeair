const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateRegistration, checkValidation } = require('../middleware/validation');
const User = require('../models/User');

// Register route - Public
router.post('/register', 
    validateRegistration,
    checkValidation,
    registerUser
);

// Login route - Public
router.post('/login', loginUser);

// Get current user - Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/check-email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.json({ available: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 