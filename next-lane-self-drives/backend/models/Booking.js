const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  pickupLocation: { type: String, default: 'Tirupur (Office)' },
  notes: String,
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  payment: {
    method: { type: String, default: 'gpay' },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    transactionId: String,
    screenshot: String,
    paidAt: Date,
  },
}, { timestamps: true })

bookingSchema.index({ user: 1, status: 1 })
bookingSchema.index({ car: 1, pickupDate: 1, returnDate: 1 })

module.exports = mongoose.model('Booking', bookingSchema)
