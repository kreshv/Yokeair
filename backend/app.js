const propertyRoutes = require('./routes/properties');
const brokerRoutes = require('./routes/brokerRoutes');

// Mount routes
app.use('/api/properties', propertyRoutes);
app.use('/api/brokers', brokerRoutes); 