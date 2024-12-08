require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const app = express();

// Connect to database
connectDB();

// Import models for seeding
const Feature = require('./models/Feature');

// Middleware
app.use(cors({
  origin: [
    'https://yokeair.com', 
    'https://www.yokeair.com', 
    'http://localhost:5173',
    'https://jolly-douhua-92a088.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/applications', applicationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Seed features on startup
    Feature.seedFeatures().catch(console.error);
}); 