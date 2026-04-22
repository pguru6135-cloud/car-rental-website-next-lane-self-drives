const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  supabase_id: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: String,
  aadhaar: {
    number: String,
    image: String,
  },
  drivingLicense: {
    number: String,
    image: String,
  },
  passportPhoto: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// password logic removed as Supabase handles auth

userSchema.methods.toPublic = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
