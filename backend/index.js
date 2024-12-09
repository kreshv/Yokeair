require('dotenv').config();

// Fallback configuration
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in .env. Using environment variables.');
  process.env.MONGODB_URI = 
    process.env.RENDER_MONGODB_URI || 
    process.env.MONGODB_CONNECTION_STRING || 
    'your-fallback-connection-string';
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Explicitly specify the path to the .env file
require('dotenv').config({ 
  path: path.resolve(__dirname, '.env'),
  debug: true  // This will log any errors in loading the .env file
});

// Log all environment variables for debugging
console.log('ALL ENV VARIABLES:', process.env);

// Explicit connection method
const connectMongoose = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    console.log('Connection URI:', uri ? 'URI provided' : 'No URI found');
    
    if (!uri) {
      throw new Error('No MongoDB URI available');
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', {
      message: error.message,
      stack: error.stack,
      environmentVariables: Object.keys(process.env)
    });
    process.exit(1);
  }
};

// Call the connection function
connectMongoose();

// Import models for seeding
const Feature = require('./models/Feature');

// Detailed logging middleware
app.use((req, res, next) => {
  console.log('Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.get('origin'));
  console.log('Headers:', req.headers);
  next();
});

// CORS configuration
app.use(cors());

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
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Mount routes with explicit paths
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/applications', applicationRoutes);

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