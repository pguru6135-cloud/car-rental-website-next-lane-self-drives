const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const User = require('../models/User')
const { protect, signToken } = require('../middleware/auth')

// Multer setup for user documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/documents')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename using user ID and fieldname to avoid collisions
    cb(null, req.user._id.toString() + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files are allowed'), false)
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
  next()
}

// POST /api/auth/register - Redundant, now handled by Supabase Client
router.post('/register', (req, res) => {
  res.status(405).json({ message: 'Registration is now handled via Supabase Auth' })
})

// POST /api/auth/login - Redundant, now handled by Supabase Client
router.post('/login', (req, res) => {
  res.status(405).json({ message: 'Login is now handled via Supabase Auth' })
})

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user })
})

// PUT /api/auth/profile
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
], validate, async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    )
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/auth/documents
router.patch('/documents', protect, upload.fields([
  { name: 'aadhaarImage', maxCount: 1 }, 
  { name: 'dlImage', maxCount: 1 }, 
  { name: 'avatar', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { aadhaarNumber, dlNumber } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (aadhaarNumber) {
      if (!user.aadhaar) user.aadhaar = {}
      user.aadhaar.number = aadhaarNumber
    }
    if (dlNumber) {
      if (!user.drivingLicense) user.drivingLicense = {}
      user.drivingLicense.number = dlNumber
    }

    if (req.files) {
      if (req.files.aadhaarImage) {
        if (!user.aadhaar) user.aadhaar = {}
        user.aadhaar.image = `/uploads/documents/${req.files.aadhaarImage[0].filename}`
      }
      if (req.files.dlImage) {
        if (!user.drivingLicense) user.drivingLicense = {}
        user.drivingLicense.image = `/uploads/documents/${req.files.dlImage[0].filename}`
      }
      if (req.files.avatar) {
        user.avatar = `/uploads/documents/${req.files.avatar[0].filename}`
      }
      if (req.files.passportPhoto) {
        user.passportPhoto = `/uploads/documents/${req.files.passportPhoto[0].filename}`
      }
    }

    await user.save()
    res.json({ user, message: 'Documents updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/seed (One-time use to create admin on production)
router.get('/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('admin123', 10)
    const admin = await User.findOneAndUpdate(
      { email: 'pguru6135@gmail.com' },
      { name: 'Admin', email: 'pguru6135@gmail.com', password: hash, role: 'admin', phone: '9342179459' },
      { upsert: true, new: true }
    )
    res.json({ message: 'Admin seeded successfully', admin: { email: admin.email, role: admin.role } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
