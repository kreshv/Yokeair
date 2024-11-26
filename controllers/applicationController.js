const Application = require('../models/Application');
const Apartment = require('../models/Apartment');
const Building = require('../models/Building');
const cloudinary = require('../utils/cloudinary');
const { Readable } = require('stream');
const { sendEmail } = require('../utils/mailer');

// Submit new application
exports.submitApplication = async (req, res) => {
    try {
        const {
            apartmentId,
            applicationType,
            monthlyIncome,
            employmentInfo,
            notes
        } = req.body;

        // Verify apartment exists and is available
        const apartment = await Apartment.findById(apartmentId);
        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }
        if (apartment.status !== 'available') {
            return res.status(400).json({ message: 'This apartment is not available' });
        }

        // Check for existing pending application
        const existingApplication = await Application.findOne({
            user: req.user.id,
            apartment: apartmentId,
            status: 'pending'
        });

        if (existingApplication) {
            return res.status(400).json({ 
                message: 'You already have a pending application for this apartment' 
            });
        }

        const application = new Application({
            user: req.user.id,
            apartment: apartmentId,
            applicationType,
            monthlyIncome,
            employmentInfo,
            notes
        });

        await application.save();

        // Populate necessary fields for email
        await application.populate([
            { path: 'apartment' },
            { path: 'user', select: 'email' }
        ]);

        // Send confirmation email
        await sendEmail(
            application.user.email,
            'applicationSubmitted',
            application
        );

        res.status(201).json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.id })
            .populate('apartment')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get broker's applications
exports.getBrokerApplications = async (req, res) => {
    try {
        // Get all buildings owned by the broker
        const buildings = await Building.find({ broker: req.user.id });
        const buildingIds = buildings.map(building => building._id);

        // Get apartments in those buildings
        const apartments = await Apartment.find({ building: { $in: buildingIds } });
        const apartmentIds = apartments.map(apartment => apartment._id);

        // Get applications for those apartments
        const applications = await Application.find({ 
            apartment: { $in: apartmentIds } 
        })
            .populate('user', 'name email')
            .populate({
                path: 'apartment',
                populate: { path: 'building' }
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('user', 'name email')
            .populate({
                path: 'apartment',
                populate: { path: 'building' }
            });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Log the application object for debugging
        console.log('Application:', application);

        // Check if apartment and building are defined
        if (!application.apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        if (!application.apartment.building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        // Check authorization
        if (req.user.role === 'client' && application.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.user.role === 'broker' && 
            application.apartment.building.broker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findById(req.params.id)
            .populate({
                path: 'apartment',
                populate: { path: 'building' }
            })
            .populate('user', 'email');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Log the application object for debugging
        console.log('Application:', application);

        // Verify broker owns the building
        if (!application.apartment || 
            !application.apartment.building || 
            (application.apartment.building.broker && 
             application.apartment.building.broker.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only send email if status is actually changing
        if (application.status !== status) {
            const emailTemplateMap = {
                under_review: 'applicationUnderReview',
                approved: 'applicationApproved',
                rejected: 'applicationRejected'
            };

            if (emailTemplateMap[status]) {
                await sendEmail(
                    application.user.email,
                    emailTemplateMap[status],
                    application
                );
            }
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Upload document
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const application = await Application.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify user owns the application
        if (application.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Convert buffer to stream
        const stream = Readable.from(req.file.buffer);

        // Upload to cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'application_documents',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.pipe(uploadStream);
        });

        // Add document to application
        application.documents.push({
            type: req.body.documentType,
            url: uploadResponse.secure_url
        });

        await application.save();
        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 