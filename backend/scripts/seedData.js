const mongoose = require('mongoose');
const Building = require('../models/Building');
const Apartment = require('../models/Apartment');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const buildings = [
  {
    name: "The Metropolitan",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    broker: "65f1f3d71c11042c6a962c00",
    amenities: [],
    description: "Luxury living in the heart of Manhattan",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"]
  },
  {
    name: "Riverside Towers",
    address: {
      street: "456 River Road",
      city: "New York",
      state: "NY",
      zipCode: "10002"
    },
    broker: "65f1f3d71c11042c6a962c00",
    amenities: [],
    description: "Modern living with riverside views",
    images: ["https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400"]
  }
];

const apartments = [
  {
    title: "Luxury 1 Bedroom",
    description: "Stunning 1 bedroom with city views",
    price: 3500,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 750,
    amenities: ["Dishwasher", "Central AC", "Hardwood Floors"],
    status: "available",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
    type: "1BR",
    unitNumber: "1A",
    neighborhood: "Manhattan",
    borough: "New York"
  },
  {
    title: "Spacious 2 Bedroom",
    description: "Modern 2 bedroom with open layout",
    price: 4500,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1100,
    amenities: ["In-unit Washer/Dryer", "Balcony", "Stainless Steel Appliances"],
    status: "available",
    images: ["https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400"],
    type: "2BR",
    unitNumber: "2B",
    neighborhood: "Manhattan",
    borough: "New York"
  },
  {
    title: "1 Bedroom with Views",
    description: "Cozy 1 bedroom with amazing city views",
    price: 2800,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 600,
    amenities: ["Dishwasher", "Central AC"],
    status: "available",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
    type: "1BR",
    unitNumber: "3C",
    neighborhood: "Manhattan",
    borough: "New York"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await Building.deleteMany({});
    await Apartment.deleteMany({});

    // Insert buildings
    const createdBuildings = await Building.create(buildings);

    // Attach buildings to apartments
    const apartmentsWithBuildings = apartments.map((apt, index) => ({
      ...apt,
      building: createdBuildings[index % createdBuildings.length]._id
    }));

    // Insert apartments
    await Apartment.create(apartmentsWithBuildings);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();