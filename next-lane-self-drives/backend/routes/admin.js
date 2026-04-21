const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect, adminOnly } = require('../middleware/auth')
const Booking = require('../models/Booking')
const Car = require('../models/Car')
const User = require('../models/User')
const Settings = require('../models/Settings')
const { getWhatsAppStatus } = require('../services/whatsapp')

// Multer setup for QR uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    // Add a timestamp to prevent the browser from caching old QR codes
    cb(null, 'gpay-qr-' + Date.now() + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

// GET /api/admin/payment-settings
router.get('/payment-settings', protect, async (req, res) => {
  try {
    const qrSetting = await Settings.findOne({ key: 'qrImage' })
    const bizSetting = await Settings.findOne({ key: 'business' })
    res.json({
      qrImage: qrSetting?.value || null,
      settings: bizSetting?.value || {},
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// All admin routes require auth + admin role
router.use(protect, adminOnly)

// GET /api/admin/stats — dashboard analytics
router.get('/stats', async (req, res) => {
  try {
    const [totalCars, availableCars, totalBookings, totalUsers, revenueAgg] = await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ available: true }),
      Booking.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ])

    const pendingBookings = await Booking.countDocuments({ status: 'pending' })
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } })

    // Monthly revenue — last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    const revenueByMonth = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['confirmed', 'active', 'completed'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const formattedRevenue = revenueByMonth.map(r => ({
      month: months[r._id.month - 1],
      revenue: r.revenue,
    }))

    // Bookings by car type
    const bookingsByType = await Booking.aggregate([
      { $lookup: { from: 'cars', localField: 'car', foreignField: '_id', as: 'carData' } },
      { $unwind: '$carData' },
      { $group: { _id: '$carData.type', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ])

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('car', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      totalCars, availableCars, totalBookings, totalUsers, pendingBookings, todayBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      revenueByMonth: formattedRevenue,
      bookingsByType,
      recentBookings,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/admin/upload-qr
router.post('/upload-qr', upload.single('qr'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const url = `/uploads/${req.file.filename}`
    await Settings.findOneAndUpdate({ key: 'qrImage' }, { value: url }, { upsert: true })
    res.json({ qrImage: url, message: 'QR uploaded successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    await Settings.findOneAndUpdate({ key: 'business' }, { value: req.body }, { upsert: true })
    res.json({ message: 'Settings updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/whatsapp-status
router.get('/whatsapp-status', async (req, res) => {
  try {
    const status = getWhatsAppStatus()
    res.json(status)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
