require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('MONGODB_URI:', MONGODB_URI);
    console.log('MONGODB_URI type:', typeof MONGODB_URI);

    await mongoose.connect(MONGODB_URI);
    
    console.log('MongoDB connected successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testConnection(); 