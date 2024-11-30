const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register route - Public
router.post('/register', registerUser);

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

module.exports = router; 