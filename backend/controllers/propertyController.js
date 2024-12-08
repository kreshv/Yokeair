const Property = require('../models/Property');
const Building = require('../models/Building');
const { upload, cloudinary } = require('../config/cloudinary');
const Feature = require('../models/Feature');
const User = require('../models/User');

exports.createProperty = async (req, res) => {
    try {
        console.log('Received property data:', req.body);

        const {
            address,
            borough,
            neighborhood,
            unitNumber,
            bedrooms,
            bathrooms,
            price,
            buildingAmenities,
            unitFeatures,
            broker
        } = req.body;

        // Check if unit already exists in the building
        const existingProperty = await Property.findOne({
            'building.address.street': address,
            'building.address.borough': borough,
            unitNumber: unitNumber
        }).populate('broker', 'name');

        if (existingProperty) {
            // If the listing exists and belongs to the same broker
            if (existingProperty.broker._id.toString() === broker) {
                return res.status(400).json({
                    message: 'You have already listed this property'
                });
            }
            // If the listing exists but belongs to a different broker
            return res.status(400).json({
                message: 'This unit is already listed by another broker'
            });
        }

        // Validate required fields
        const requiredFields = {
            address,
            borough,
            neighborhood,
            unitNumber,
            bedrooms,
            bathrooms,
            price,
            broker
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value && value !== 0)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields,
                receivedData: req.body
            });
        }

        // Create or find building
        let building = await Building.findOne({
            'address.street': address,
            'address.borough': borough
        });

        if (!building) {
            building = await Building.create({
                name: address,
                address: {
                    street: address,
                    borough: borough,
                    neighborhood: neighborhood
                },
                amenities: buildingAmenities || [],
                broker
            });
        }

        // Parse numeric values
        const parsedBedrooms = parseInt(bedrooms);
        const parsedBathrooms = parseFloat(bathrooms);
        const parsedPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));

        // Check for existing unit in the building
        const existingUnit = await Property.findOne({
            building: building._id,
            unitNumber: unitNumber
        });

        if (existingUnit) {
            return res.status(400).json({
                message: 'Unit already exists in this building'
            });
        }

        const property = await Property.create({
            building: building._id,
            borough: borough,
            neighborhood: neighborhood,
            unitNumber,
            type: parsedBedrooms === 0 ? 'studio' : `${parsedBedrooms}BR`,
            status: 'available',
            price: parsedPrice,
            bedrooms: parsedBedrooms,
            bathrooms: parsedBathrooms,
            features: unitFeatures || [],
            broker
        });

        await property.populate('building features');
        
        res.status(201).json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({
            message: 'Error creating property listing',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const { buildingAmenities, unitFeatures, price, squareFootage } = req.body;
        const propertyId = req.params.id;

        // Find the property
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user is the broker of this property
        if (property.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        // Update building amenities if provided
        if (buildingAmenities && buildingAmenities.length > 0) {
            const building = await Building.findById(property.building);
            if (building) {
                building.amenities = buildingAmenities;
                await building.save();
            }
        }

        // Update property features
        if (unitFeatures && unitFeatures.length > 0) {
            // Find or create features
            const featurePromises = unitFeatures.map(async (featureData) => {
                let feature = await Feature.findOne({ 
                    name: featureData.name, 
                    category: 'Unit Feature' 
                });
                
                if (!feature) {
                    feature = new Feature({ 
                        name: featureData.name, 
                        category: 'Unit Feature' 
                    });
                    await feature.save();
                }
                
                return feature._id;
            });

            property.features = await Promise.all(featurePromises);
        } else {
            // If no features are provided, clear existing features
            property.features = [];
        }

        // Update price if provided
        if (price !== undefined) {
            property.price = price;
        }

        // Update square footage if provided
        if (squareFootage !== undefined) {
            property.squareFootage = squareFootage;
        }

        await property.save();

        // Populate the updated property
        await property.populate(['building', 'features']);

        res.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({
            message: 'Error updating property',
            error: error.message
        });
    }
};

exports.getBrokerProperties = async (req, res) => {
    try {
        const properties = await Property.find({ broker: req.user.id })
            .populate({
                path: 'building',
                select: 'name address amenities'
            })
            .populate('features')
            .sort('-createdAt');

        res.json(properties);
    } catch (error) {
        console.error('Error fetching broker properties:', error);
        res.status(500).json({
            message: 'Error fetching properties',
            error: error.message
        });
    }
};

exports.searchProperties = async (req, res) => {
    try {
        const {
            neighborhoods,
            boroughs,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            amenities,
            features
        } = req.query;

        console.log('Received search params:', { 
            neighborhoods, boroughs, bedrooms, bathrooms, amenities, features 
        });

        let query = { status: 'available' };

        // Neighborhood filter
        if (neighborhoods && neighborhoods.length > 0) {
            const neighborhoodArray = Array.isArray(neighborhoods) ? neighborhoods : [neighborhoods];
            query.neighborhood = { $in: neighborhoodArray };
        }

        // Borough filter
        if (boroughs && boroughs.length > 0) {
            const boroughArray = Array.isArray(boroughs) ? boroughs : [boroughs];
            query.borough = { $in: boroughArray };
        }

        // Bedrooms filter
        if (bedrooms && bedrooms !== 'any') {
            query.bedrooms = parseInt(bedrooms);
        }

        // Bathrooms filter
        if (bathrooms && bathrooms !== 'any') {
            query.bathrooms = parseFloat(bathrooms);
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        // Building amenities filter
        if (amenities && amenities.length > 0) {
            const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
            // First, find buildings with these amenities
            const buildingsWithAmenities = await Building.find({
                amenities: { $all: amenityArray }
            }).select('_id');
            
            // Add building filter to query
            query.building = { 
                $in: buildingsWithAmenities.map(b => b._id) 
            };
        }

        // Unit features filter
        if (features && features.length > 0) {
            const featureArray = Array.isArray(features) ? features : [features];
            query.features = { $all: featureArray };
        }

        console.log('Final query:', JSON.stringify(query, null, 2));

        const properties = await Property.find(query)
            .populate({
                path: 'building',
                select: 'name address amenities',
                populate: {
                    path: 'amenities',
                    model: 'Amenity'
                }
            })
            .populate('features')
            .sort('-createdAt');

        console.log(`Found ${properties.length} properties`);
        
        res.json(properties);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching properties' });
    }
};

exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const propertyId = req.params.id;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        property.status = status;
        await property.save();

        res.json(property);
    } catch (error) {
        console.error('Error updating property status:', error);
        res.status(500).json({ message: 'Error updating property status' });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('building');
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }

        // Delete images from Cloudinary
        if (property.images && property.images.length > 0) {
            const deletePromises = property.images.map(async (image) => {
                if (image.public_id) {
                    try {
                        await cloudinary.uploader.destroy(image.public_id);
                    } catch (error) {
                        console.error(`Failed to delete image ${image.public_id}:`, error);
                    }
                }
            });

            await Promise.all(deletePromises);
        }

        // Remove property reference from all users' savedListings
        await User.updateMany(
            { savedListings: property._id },
            { $pull: { savedListings: property._id } }
        );

        // Check if this is the last property in the building
        const propertiesInBuilding = await Property.countDocuments({ 
            building: property.building._id 
        });

        // Delete the property using findByIdAndDelete
        await Property.findByIdAndDelete(property._id);

        // If this was the last property, delete the building too
        if (propertiesInBuilding === 1) {
            await Building.findByIdAndDelete(property.building._id);
        }
        
        res.json({ 
            message: 'Property and associated data deleted successfully',
            deletedProperty: property
        });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ 
            message: 'Error deleting property',
            error: error.message 
        });
    }
};

exports.uploadImages = async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            return res.status(400).json({ 
                message: `Invalid file type(s): ${invalidFiles.map(f => f.originalname).join(', ')}. Only JPG, PNG, and WebP files are allowed.` 
            });
        }

        const propertyId = req.params.id;
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if this broker owns the property
        if (property.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to modify this property' });
        }

        // Initialize images array if it doesn't exist
        if (!property.images) {
            property.images = [];
        }

        // Process the uploaded files
        const imageData = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        // Add new images to the property
        property.images = property.images.concat(imageData);
        
        // Save the updated property
        await property.save();

        // Return only the newly uploaded images
        res.json({ 
            message: 'Images uploaded successfully',
            images: imageData
        });

    } catch (error) {
        console.error('Error in uploadImages:', error);
        
        // Delete uploaded files if there was an error
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                try {
                    if (file.filename) {
                        await deleteImage(file.filename);
                    }
                } catch (deleteError) {
                    console.error('Error deleting file after upload failure:', deleteError);
                }
            }
        }
        
        res.status(500).json({ 
            message: 'Failed to upload images',
            error: error.message 
        });
    }
};

exports.bulkDeleteProperties = async (req, res) => {
    try {
        console.log('Bulk delete request received:', req.body);
        const { propertyIds } = req.body;
        
        if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(400).json({ message: 'No properties selected for deletion' });
        }

        // Verify all properties belong to the current broker
        const properties = await Property.find({
            _id: { $in: propertyIds },
            broker: req.user.id
        });

        console.log('Found properties:', properties.length);

        if (properties.length !== propertyIds.length) {
            return res.status(403).json({ 
                message: 'You are not authorized to delete one or more of these properties' 
            });
        }

        // Delete all properties
        const deleteResult = await Property.deleteMany({ 
            _id: { $in: propertyIds },
            broker: req.user.id  // Extra safety check
        });

        console.log('Delete result:', deleteResult);
        
        // Remove property references from all users' savedListings
        await User.updateMany(
            { savedListings: { $in: propertyIds } },
            { $pull: { savedListings: { $in: propertyIds } } }
        );

        res.json({ 
            message: 'Properties deleted successfully',
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Error in bulkDeleteProperties:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            message: 'Error deleting properties',
            error: error.message,
            stack: error.stack
        });
    }
}; 