require('dotenv').config();
const mongoose = require('mongoose');

const wipeDB = async () => {
  try {
    // Connect using existing environment variable from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Drop the entire "nextlane" database to clear out all data
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Entire database and all collections have been completely dropped.');
    console.log('✅ You are now starting completely fresh!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error wiping database:', error);
    process.exit(1);
  }
};

wipeDB();
