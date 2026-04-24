const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextlane')
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    console.log('⚠️ Server continuing in "Offline DB" mode...')
    // process.exit(1) // Removed to prevent crash
  }
}

module.exports = connectDB
