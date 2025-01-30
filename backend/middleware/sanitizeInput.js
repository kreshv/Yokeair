const sanitize = require('express-mongo-sanitize');

module.exports = (req, res, next) => {
    sanitize()(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                message: 'Invalid input data format' 
            });
        }
        next();
    });
}; 