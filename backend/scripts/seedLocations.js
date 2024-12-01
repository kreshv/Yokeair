const mongoose = require('mongoose');
const Location = require('../models/Location');
require('dotenv').config();

const locations = [
  {
    borough: 'Manhattan',
    neighborhoods: ['Upper East Side', 'Upper West Side', 'Chelsea', 'Greenwich Village']
  },
  {
    borough: 'Brooklyn',
    neighborhoods: ['Williamsburg', 'DUMBO', 'Park Slope', 'Brooklyn Heights']
  },
  {
    borough: 'Queens',
    neighborhoods: ['Astoria', 'Long Island City', 'Forest Hills', 'Flushing']
  },
  {
    borough: 'Bronx',
    neighborhoods: ['Riverdale', 'Fordham', 'Pelham Bay', 'Morris Park']
  },
  {
    borough: 'Staten Island',
    neighborhoods: ['St. George', 'Tottenville', 'Great Kills', 'West Brighton']
  }
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing locations
    await Location.deleteMany({});
    
    // Insert new locations
    await Location.insertMany(locations);
    
    console.log('Locations seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding locations:', error);
    process.exit(1);
  }
};

seedLocations(); 