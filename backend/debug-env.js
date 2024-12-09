console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('All Environment Variables:', JSON.stringify(process.env, null, 2));