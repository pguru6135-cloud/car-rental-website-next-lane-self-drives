const express = require('express')
const router = express.Router()
const Booking = require('../models/Booking')
const Car = require('../models/Car')
const { protect, adminOnly } = require('../middleware/auth')
const { sendBookingConfirmation, sendPaymentSuccessEmail } = require('../controllers/emailController')
const { sendWhatsAppMessage } = require('../services/whatsapp')
const { format } = require('date-fns')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Tesseract = require('tesseract.js')

// Multer setup for payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/screenshots')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, 'payment-' + Date.now() + path.extname(file.originalname))
  },
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files are allowed'), false)
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

// POST /api/bookings — create booking (auth required)
router.post('/', protect, async (req, res) => {
  try {
    const { car: carId, pickupDate, returnDate, pickupLocation, notes, totalAmount, name, phone, email } = req.body

    // Validate dates
    const pickup = new Date(pickupDate)
    const ret = new Date(returnDate)
    if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
      return res.status(400).json({ message: 'Invalid pickup or return date' })
    }
    if (pickup < new Date()) return res.status(400).json({ message: 'Pickup date cannot be in the past' })
    if (ret <= pickup) return res.status(400).json({ message: 'Return date must be after pickup date' })

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: 'Valid total amount is required' })
    }

    if (!email) return res.status(400).json({ message: 'Email is required for booking confirmation' })

    // Check car exists and is available
    const car = await Car.findById(carId)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (!car.available) return res.status(400).json({ message: 'Car is not available' })

    // Prevent price spoofing: Verify total amount hasn't been tampered with
    const days = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24)) || 1
    const minExpectedPrice = days * car.pricePerDay
    if (Number(totalAmount) < minExpectedPrice) {
      return res.status(400).json({ message: 'Total amount is less than the expected base price.' })
    }

    // Check date conflicts
    const conflict = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      pickupDate: { $lt: ret },
      returnDate: { $gt: pickup },
    })
    if (conflict) return res.status(400).json({ message: 'Car is already booked for these dates' })

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      name,
      email,
      phone,
      pickupDate: pickup,
      returnDate: ret,
      pickupLocation,
      notes,
      totalAmount,
    })

    await booking.populate('car', 'name brand type')

    // Initial Notifications (Fire and forget)
    sendBookingConfirmation(req.user, booking, booking.car).catch(console.error)
    
    if (booking.phone) {
      const cleanPhone = booking.phone.replace(/\D/g, '').slice(-10)
      if (cleanPhone.length === 10) {
        const welcomeMsg = `🚗 *Booking Reserved!*\n\nHi ${booking.name},\nWe've received your booking for *${booking.car.name}*.\n\n*Next Steps:*\n1. Pay ₹${booking.totalAmount.toLocaleString('en-IN')} via GPay to *9342179459*.\n2. Upload the screenshot in the app to confirm.\n\nBooking ID: #${booking._id.toString().slice(-8).toUpperCase()}`;
        sendWhatsAppMessage('91' + cleanPhone, welcomeMsg).catch(console.error)
      }
    }

    res.status(201).json({ booking, message: 'Booking created successfully. Pending payment.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/bookings/:id/payment — update payment details and verify
router.patch('/:id/payment', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { transactionId } = req.body
    if (!transactionId) return res.status(400).json({ message: 'Transaction ID is required' })
    if (!req.file) return res.status(400).json({ message: 'Payment screenshot is required' })

    const booking = await Booking.findById(req.params.id).populate('car', 'name brand type')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // Users can only update their own bookings
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (booking.payment.status === 'paid') {
      // If they somehow retry, cleanup
      if (req.file) fs.unlinkSync(req.file.path)
      return res.status(400).json({ message: 'Payment already verified' })
    }

    const screenshotPath = req.file.path

    // Verify Transaction ID via OCR
    try {
      const { data: { text } } = await Tesseract.recognize(screenshotPath, 'eng')
      const sanitizedText = text.replace(/\s+/g, '').toLowerCase()
      const sanitizedTxnId = transactionId.replace(/\s+/g, '').toLowerCase()

      if (!sanitizedText.includes(sanitizedTxnId)) {
        // Verification failed, delete image
        fs.unlinkSync(screenshotPath)
        return res.status(400).json({ message: 'Transaction ID could not be verified in the uploaded screenshot.' })
      }
    } catch (ocrErr) {
      console.error('OCR Verification Error:', ocrErr)
      fs.unlinkSync(screenshotPath)
      return res.status(500).json({ message: 'Failed to analyze the screenshot for verification.' })
    }

    const screenshotUrl = `/uploads/screenshots/${req.file.filename}`

    booking.payment.transactionId = transactionId
    booking.payment.screenshot = screenshotUrl
    booking.payment.status = 'paid'
    booking.payment.paidAt = new Date()
    booking.status = 'confirmed' // Auto-confirm on payment success
    await booking.save()

    // Send final confirmation (Email + WhatsApp)
    sendPaymentSuccessEmail(req.user, booking, booking.car).catch(console.error)

    const pickupStr = format(new Date(booking.pickupDate), 'dd MMM, hh:mm aa')
    const returnStr = format(new Date(booking.returnDate), 'dd MMM, hh:mm aa')

    const userMsg = `✅ *Booking Confirmed!*\n\nHi ${booking.name},\nYour ride for *${booking.car.name}* is officially confirmed.\n\n📅 *Pickup:* ${pickupStr}\n📅 *Return:* ${returnStr}\n📍 *Location:* ${booking.pickupLocation}\n\n*Booking ID:* #${booking._id.toString().slice(-8).toUpperCase()}\n\nPlease carry your original Driving License. Safe Journey! 🚗`;
    
    const adminMsg = `🔔 *Payment Verified*\n\nCustomer: ${booking.name}\nCar: ${booking.car.name}\nTotal: ₹${booking.totalAmount}\nStatus: CONFIRMED`;
    
    sendWhatsAppMessage('919342179459', adminMsg).catch(console.error)
    if (booking.phone) {
      const cleanPhone = booking.phone.replace(/\D/g, '').slice(-10)
      if (cleanPhone.length === 10) {
        sendWhatsAppMessage('91' + cleanPhone, userMsg).catch(console.error)
      }
    }

    res.json({ booking, message: 'Payment verified successfully and booking confirmed.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings/my — user's own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car', 'name brand type image')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings — admin: all bookings
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const query = status ? { status } : {}
    const bookings = await Booking.find(query)
      .populate('car', 'name brand type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    const total = await Booking.countDocuments(query)
    res.json({ bookings, total, page: Number(page) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings/:id — single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'name brand type image pricePerDay')
      .populate('user', 'name email phone')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // Users can only see their own bookings
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/bookings/:id/status — admin update status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const valid = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' })

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('car', 'name brand')
      .populate('user', 'name email')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/bookings/:id/cancel — user cancel own booking
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' })
    }
    booking.status = 'cancelled'
    await booking.save()
    res.json({ booking, message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/bookings/:id/resend-whatsapp — user/admin resend notification
router.post('/:id/resend-whatsapp', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car', 'name brand type')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const pickupStr = format(new Date(booking.pickupDate), 'dd MMM, hh:mm aa')
    const returnStr = format(new Date(booking.returnDate), 'dd MMM, hh:mm aa')

    const userMsg = `✅ *Booking Confirmed!*\n\nHi ${booking.name},\nYour ride for *${booking.car.name}* is officially confirmed.\n\n📅 *Pickup:* ${pickupStr}\n📅 *Return:* ${returnStr}\n📍 *Location:* ${booking.pickupLocation}\n\n*Booking ID:* #${booking._id.toString().slice(-8).toUpperCase()}\n\nPlease carry your original Driving License. Safe Journey! 🚗`;
    
    if (booking.phone) {
      const cleanPhone = booking.phone.replace(/\D/g, '').slice(-10)
      if (cleanPhone.length === 10) {
        const sent = await sendWhatsAppMessage('91' + cleanPhone, userMsg)
        if (sent) return res.json({ message: 'WhatsApp message sent successfully' })
        return res.status(500).json({ message: 'WhatsApp service is not ready' })
      }
    }
    res.status(400).json({ message: 'Invalid phone number' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
