const path = require('path');
console.log('Current working directory:', process.cwd());

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '.env.production')
    : path.join(__dirname, '.env.development')
});

console.log('MONGODB_URI from process.env:', process.env.MONGODB_URI);
console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const securityHeaders = require('./middleware/securityHeaders');
const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://jolly-douhua-92a088.netlify.app', 'https://yokeair.onrender.com', 'https://yokeair.com', 'https://www.yokeair.com']
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['x-auth-token'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS first, before any other middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed logging middleware - only in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log('Request Details:');
        console.log('Method:', req.method);
        console.log('Path:', req.path);
        console.log('Origin:', req.get('origin'));
        console.log('Headers:', req.headers);
        next();
    });
}

// Import models for seeding
const Feature = require('./models/Feature');

// Explicit connection method
const connectMongoose = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('Detected URI:', uri);
    if (!uri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    console.log('Attempting to connect with URI:', uri);
    
    console.log('Connection URI:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('MongoDB connected successfully');
    
    // Seed features using the model's seeding function
    await Feature.seedFeatures();
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in production
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Call the connection function
connectMongoose();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const brokerRoutes = require('./routes/brokers');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/brokers', brokerRoutes);

// After other route registrations, add:
app.use('/api/features', require('./routes/features'));

// Catch-all route for debugging
app.use('*', (req, res) => {
    console.log('404 Not Found:', {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      params: req.params,
      query: req.query
    });
    res.status(404).json({
      message: 'Route not found',
      requestedPath: req.originalUrl,
      method: req.method,
      baseUrl: req.baseUrl,
      path: req.path
    });
  });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5001;

// Initialize server
console.log('Initializing server...');
console.log('Connecting to MongoDB...');

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});

module.exports = app; 