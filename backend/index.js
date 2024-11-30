require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/apartments', require('./routes/apartmentRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/amenities', require('./routes/amenityRoutes'));

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Yoke API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 