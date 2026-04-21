const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, select: false },
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.toPublic = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
