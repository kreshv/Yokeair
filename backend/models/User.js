const mongoose = require('mongoose');
const { deleteImage } = require('../utils/cloudinary');
const path = require('path');
const url = require('url');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'broker'],
        required: true,
        default: 'client'
    },
    profilePicture: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }]
});

// Add compound index
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Pre-delete middleware to remove Cloudinary profile picture
userSchema.pre('deleteOne', { document: true }, async function(next) {
    try {
        // If a profile picture exists, extract the public ID from the Cloudinary URL
        if (this.profilePicture) {
            // Parse the URL
            const parsedUrl = url.parse(this.profilePicture);
            
            // Extract the path and remove leading slash
            const pathParts = parsedUrl.pathname ? parsedUrl.pathname.split('/') : [];
            
            // Find the upload segment and get the public ID
            const uploadIndex = pathParts.indexOf('upload');
            let publicId;
            
            if (uploadIndex !== -1 && pathParts.length > uploadIndex + 2) {
                // Cloudinary URL format: /upload/v1234/folder/imagename
                publicId = pathParts.slice(uploadIndex + 2).join('/').split('.')[0];
            } else {
                // Fallback: use basename without extension
                publicId = path.basename(this.profilePicture, path.extname(this.profilePicture));
            }

            console.log('Attempting to delete Cloudinary image with public ID:', publicId);
            
            // Delete the image
            await deleteImage(publicId);
        }
        next();
    } catch (error) {
        console.error('Error deleting profile picture from Cloudinary:', error);
        // Continue with deletion even if image deletion fails
        next();
    }
});

// Pre-delete middleware to remove associated properties for broker users
userSchema.pre('deleteOne', { document: true }, async function(next) {
    try {
        // Only delete properties if the user is a broker
        if (this.role === 'broker') {
            const Property = mongoose.model('Property');
            
            // Find all properties by this broker
            const properties = await Property.find({ broker: this._id });
            
            // Delete each property
            for (const property of properties) {
                await Property.findByIdAndDelete(property._id);
            }
        }
        next();
    } catch (error) {
        console.error('Error deleting associated properties:', error);
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema); 