require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const cookieParser = require('cookie-parser')
const { createClient: createSupabaseClient } = require('./utils/supabase/server')


const connectDB = require('./config/db')

const app = express()

// Connect DB
connectDB()

// Initialize WhatsApp Service
const { initializeWhatsApp } = require('./services/whatsapp')
initializeWhatsApp()

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cookieParser())

// Supabase Session Middleware
app.use(async (req, res, next) => {
  const supabase = createSupabaseClient(req, res)
  const { data: { user } } = await supabase.auth.getUser()
  req.supabase = supabase
  req.user = user
  next()
})


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://jazzy-melba-611368.netlify.app",
  process.env.FRONTEND_URL
].filter(Boolean)
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' }))
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/cars', require('./routes/cars'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }))

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'client/dist')))

// Catch-all route to serve the frontend index.html for non-API routes
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' })
  }
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚗 Next Lane backend running on port ${PORT}`)
})
