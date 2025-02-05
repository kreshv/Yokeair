const propertyRoutes = require('./routes/propertyRoutes');
const brokerRoutes = require('./routes/brokerRoutes');

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/brokers', brokerRoutes); 