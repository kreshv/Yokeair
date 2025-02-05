const Property = require('../models/Property');
const Building = require('../models/Building');
const { upload, cloudinary } = require('../config/cloudinary');
const Feature = require('../models/Feature');
const User = require('../models/User');
const mongoose = require('mongoose');
const Amenity = require('../models/Amenity');

exports.createProperty = async (req, res) => {
    try {
        // Add input validation
        if (!req.body.address || !req.body.borough) {
            return res.status(400).json({ 
                message: 'Missing required fields: address and borough' 
            });
        }

        console.log('Received property data:', req.body);

        const {
            address,
            borough,
            neighborhood,
            unitNumber,
            bedrooms,
            bathrooms,
            price,
            squareFootage,
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
        const parsedSquareFootage = parseInt(squareFootage);

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
            squareFootage: parsedSquareFootage,
            features: unitFeatures || [],
            broker
        });

        await property.populate('building features');
        
        res.status(201).json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({
            message: 'Server Error',
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
};

exports.updateProperty = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { price, squareFootage, features, buildingAmenities, images } = req.body;
        
        // Find property
        let property = await Property.findById(req.params.id)
            .populate('building')
            .populate('features')
            .session(session);
        
        if (!property) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Property not found' });
        }

        // Update basic fields
        if (price !== undefined) property.price = price;
        if (squareFootage !== undefined) property.squareFootage = squareFootage;
        
        // Update features
        if (features) {
            // If features is an array of IDs, use them directly
            if (features.every(f => mongoose.Types.ObjectId.isValid(f))) {
                property.features = features;
            } else {
                // If features is an array of names, create/find features
                const featureIds = await Promise.all(features.map(async name => {
                    let feature = await Feature.findOne({ name }).session(session);
                    if (!feature) {
                        feature = await Feature.create([{ 
                            name,
                            category: 'Unit Feature'
                        }], { session });
                        feature = feature[0];
                    }
                    return feature._id;
                }));
                property.features = featureIds;
            }
        }

        // Update building amenities
        if (buildingAmenities && property.building) {
            const amenityIds = await Promise.all(buildingAmenities.map(async name => {
                let amenity = await Amenity.findOne({ name, type: 'building' }).session(session);
                if (!amenity) {
                    amenity = await Amenity.create([{
                        name,
                        type: 'building'
                    }], { session });
                    amenity = amenity[0];
                }
                return amenity._id;
            }));

            // Update building amenities
            await Building.findByIdAndUpdate(
                property.building._id,
                { amenities: amenityIds },
                { session }
            );
        }

        // Update images
        if (images) {
            property.images = images;
        }

        // Save and populate
        await property.save({ session });
        await property.populate([
            {
                path: 'building',
                populate: {
                    path: 'amenities'
                }
            },
            'features'
        ]);

        await session.commitTransaction();
        res.json(property);
    } catch (error) {
        await session.abortTransaction();
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Failed to update property' });
    } finally {
        session.endSession();
    }
};

exports.getBrokerProperties = async (req, res) => {
    try {
        const properties = await Property.find({ broker: req.user.id })
            .populate({
                path: 'building',
                select: 'name address amenities',
                populate: {
                    path: 'amenities',
                    select: 'name type'
                }
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
            search, 
            neighborhoods, 
            boroughs, 
            amenities, 
            features,
            bedrooms,
            bathrooms,
            minPrice,
            maxPrice
        } = req.query;
        
        let query = {};
        
        // Handle location-based filters
        if (neighborhoods && neighborhoods.length > 0) {
            const neighborhoodArray = Array.isArray(neighborhoods) 
                ? neighborhoods 
                : [neighborhoods];
            query.neighborhood = { $in: neighborhoodArray };
        }

        if (boroughs && boroughs.length > 0) {
            const boroughArray = Array.isArray(boroughs) 
                ? boroughs 
                : [boroughs];
            query.borough = { $in: boroughArray };
        }

        // Handle building amenity filters
        if (amenities && amenities.length > 0) {
            const amenityArray = Array.isArray(amenities) 
                ? amenities 
                : [amenities];
            
            // Find buildings that have all the specified amenities
            const buildingsWithAmenities = await Building.find({
                amenities: { $all: amenityArray }
            }).select('_id');

            // Add building filter to query
            query.building = { 
                $in: buildingsWithAmenities.map(b => b._id) 
            };
        }

        // Handle unit feature filters
        if (features && features.length > 0) {
            const featureArray = Array.isArray(features) 
                ? features 
                : [features];
            
            // Find properties that have all the specified features
            query.features = { $all: featureArray };
        }

        // Handle bedrooms filter
        if (bedrooms && bedrooms !== 'any') {
            query.bedrooms = parseInt(bedrooms);
        }

        // Handle bathrooms filter
        if (bathrooms && bathrooms !== 'any') {
            query.bathrooms = parseFloat(bathrooms);
        }

        // Handle price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }
        
        // Handle text search if provided
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            
            // First, find buildings that match the search criteria
            const matchingBuildings = await Building.find({
                $or: [
                    { 'address.street': searchRegex },
                    { 'address.city': searchRegex }
                ]
            }).select('_id');

            const buildingIds = matchingBuildings.map(b => b._id);

            // Combine search criteria with existing query using $and to preserve other filters
            const searchQuery = {
                $or: [
                    { building: { $in: buildingIds } },
                    { borough: searchRegex },
                    { neighborhood: searchRegex },
                    { unitNumber: searchRegex }
                ]
            };

            query = query.hasOwnProperty('$and') 
                ? { ...query, $and: [...query.$and, searchQuery] }
                : { ...query, ...searchQuery };
        }

        console.log('Final query:', JSON.stringify(query, null, 2));

        // Find properties based on query
        const properties = await Property.find(query)
            .populate({
                path: 'building',
                populate: {
                    path: 'amenities'
                }
            })
            .populate('features')
            .sort({ createdAt: -1 });

        res.json(properties);
    } catch (error) {
        console.error('Property search error:', error);
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
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const uploadPromises = req.files.map(async (file) => {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'yoke_properties',
                    transformation: [
                        { width: 2000, height: 2000, crop: 'limit', quality: 'auto:best' },
                        { fetch_format: 'auto' }
                    ]
                });

                return {
                    url: result.secure_url,
                    public_id: result.public_id
                };
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                throw error;
            }
        });

        const uploadedImages = await Promise.all(uploadPromises);

        // Add new images to existing ones
        property.images = [...(property.images || []), ...uploadedImages];
        await property.save();

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: property.images
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
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

exports.getProperty = async (req, res) => {
    try {
        // First, get the property with basic population
        const property = await Property.findById(req.params.id)
            .populate('features', 'name')
            .populate({
                path: 'building',
                populate: {
                    path: 'amenities',
                    model: 'Amenity',
                    select: 'name type'
                }
            })
            .lean();

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        console.log('Property with populated amenities:', property.building?.amenities);
        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(500).json({ message: 'Error fetching property' });
    }
}; 