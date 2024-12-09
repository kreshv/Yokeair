console.log('Current working directory:', process.cwd());
console.log('Environment variables:', JSON.stringify(process.env, null, 2));
require('dotenv').config();
console.log('MONGODB_URI after dotenv:', process.env.MONGODB_URI); 