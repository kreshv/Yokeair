const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const checkBrokerRole = (req, res, next) => {
    if (req.user && req.user.role === 'broker') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Broker only.' });
    }
};

const checkClientRole = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Client only.' });
    }
};

module.exports = { auth, checkBrokerRole, checkClientRole }; 