require('dotenv').config();
const mongoose = require('mongoose');
const Amenity = require('./models/Amenity'); // Adjust the path if necessary

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Define building amenities and unit features
const amenities = [
    { name: 'Elevator', type: 'building' },
    { name: 'Gym', type: 'building' },
    { name: 'Rooftop', type: 'building' },
    { name: 'Storage', type: 'building' },
    { name: 'Bike room', type: 'building' },
    { name: 'Laundry in building', type: 'building' },
    { name: 'Lounge', type: 'building' },
    { name: 'Garage parking', type: 'building' },
    { name: 'Package room', type: 'building' },
    { name: 'Balcony', type: 'unit' },
    { name: 'Terrace', type: 'unit' },
    { name: 'Backyard', type: 'unit' },
    { name: 'Dishwasher', type: 'unit' },
    { name: 'Washer/Dryer', type: 'unit' }
];

// Insert amenities into the database
Amenity.insertMany(amenities)
    .then(() => {
        console.log('Amenities added successfully!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error adding amenities:', err);
        mongoose.connection.close();
    }); 