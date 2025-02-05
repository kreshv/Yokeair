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

// Detailed logging middleware
app.use((req, res, next) => {
  console.log('Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.get('origin'));
  console.log('Headers:', req.headers);
  next();
});

// Update CORS configuration to allow both development and production domains
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yokeair.com', 'https://www.yokeair.com', 'https://jolly-douhua-92a088.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(securityHeaders);

app.use(express.json());

// Basic route tests
app.get('/', (req, res) => {
  res.json({ message: 'Root endpoint working' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint working' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const amenityRoutes = require('./routes/amenities');
const featureRoutes = require('./routes/features');
const brokerRoutes = require('./routes/brokers');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/brokers', brokerRoutes);

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
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

// Initialize server
console.log('Initializing server...');
console.log('Connecting to MongoDB...');

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
}); 