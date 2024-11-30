const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    applicationSubmitted: (application) => ({
        subject: 'Application Submitted Successfully',
        text: `Your application for apartment ${application.apartment.unitNumber} has been submitted successfully. We will review your application and get back to you soon.`
    }),
    applicationUnderReview: (application) => ({
        subject: 'Application Under Review',
        text: `Your application for apartment ${application.apartment.unitNumber} is now under review. We will notify you of any updates.`
    }),
    applicationApproved: (application) => ({
        subject: 'Application Approved!',
        text: `Congratulations! Your application for apartment ${application.apartment.unitNumber} has been approved. Our team will contact you shortly with next steps.`
    }),
    applicationRejected: (application) => ({
        subject: 'Application Status Update',
        text: `We regret to inform you that your application for apartment ${application.apartment.unitNumber} was not approved at this time.`
    })
};

// Send email function
const sendEmail = async (to, template, application) => {
    try {
        const emailContent = emailTemplates[template](application);
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: emailContent.subject,
            text: emailContent.text
        });

        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = { sendEmail }; 