const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');

async function cleanup() {
    try {
        await mongoose.connect('mongodb+srv://admin:kreshnik12345@cluster0.7mtse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB');
        
        // Find all properties
        const properties = await Property.find();
        console.log(`Found ${properties.length} total properties`);
        
        let deletedCount = 0;
        
        // Check each property's broker
        for (const property of properties) {
            const broker = await User.findById(property.broker);
            if (!broker) {
                console.log(`Found orphaned property: ${property._id} (Unit ${property.unitNumber})`);
                
                // Delete the property
                await Property.findByIdAndDelete(property._id);
                deletedCount++;
                console.log('Deleted orphaned property');
            }
        }
        
        console.log(`Finished cleaning up ${deletedCount} orphaned properties`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

cleanup(); 