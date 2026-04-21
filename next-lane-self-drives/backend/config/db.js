const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextlane')
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
}

module.exports = connectDB
