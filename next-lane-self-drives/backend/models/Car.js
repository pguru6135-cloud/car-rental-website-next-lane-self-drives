const mongoose = require('mongoose')

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Luxury'], required: true },
  pricePerDay: { type: Number, required: true },
  seats: { type: Number, default: 5 },
  fuel: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'], default: 'Petrol' },
  transmission: { type: String, enum: ['Manual', 'Automatic', 'AMT'], default: 'Manual' },
  mileage: String,
  color: String,
  description: String,
  image: String,
  images: [String],
  features: [String],
  available: { type: Boolean, default: true },
  registrationNumber: String,
}, { timestamps: true })

carSchema.index({ type: 1, available: 1, pricePerDay: 1 })

module.exports = mongoose.model('Car', carSchema)
