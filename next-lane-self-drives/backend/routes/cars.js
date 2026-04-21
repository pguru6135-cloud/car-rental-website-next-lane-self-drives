const express = require('express')
const router = express.Router()
const Car = require('../models/Car')
const Booking = require('../models/Booking')
const { protect, adminOnly } = require('../middleware/auth')

// GET /api/cars — public, filterable
router.get('/', async (req, res) => {
  try {
    const { type, fuel, minPrice, maxPrice, available, sort } = req.query
    const query = {}
    if (type && type !== 'All') query.type = type
    if (fuel && fuel !== 'All') query.fuel = fuel
    if (available !== undefined) query.available = available === 'true'
    if (minPrice || maxPrice) {
      query.pricePerDay = {}
      if (minPrice) query.pricePerDay.$gte = Number(minPrice)
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice)
    }

    let sortOption = {}
    if (sort === 'price_asc') sortOption = { pricePerDay: 1 }
    else if (sort === 'price_desc') sortOption = { pricePerDay: -1 }
    else if (sort === 'year_desc') sortOption = { year: -1 }
    else sortOption = { createdAt: -1 }

    const cars = await Car.find(query).sort(sortOption)
    res.json({ cars })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/cars/:id — public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json({ car })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/cars/:id/availability — check date conflicts
router.get('/:id/availability', async (req, res) => {
  try {
    const { start, end } = req.query
    if (!start || !end) return res.status(400).json({ message: 'start and end dates required' })

    const conflict = await Booking.findOne({
      car: req.params.id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      pickupDate: { $lt: new Date(end) },
      returnDate: { $gt: new Date(start) }
    })
    res.json({ available: !conflict })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/cars — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.create(req.body)
    res.status(201).json({ car })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/cars/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json({ car })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/cars/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Prevent deleting cars that have active bookings to avoid breaking the frontend
    const activeBookings = await Booking.findOne({
      car: req.params.id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    })
    if (activeBookings) {
      return res.status(400).json({ message: 'Cannot delete car: It has active or pending bookings.' })
    }

    const car = await Car.findByIdAndDelete(req.params.id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json({ message: 'Car deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
