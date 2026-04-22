const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  try {
    // req.user was already populated by the global Supabase middleware in server.js
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // Find the corresponding MongoDB user by email
    let user = await User.findOne({ email: req.user.email })

    if (!user) {
      // If user exists in Supabase but not in MongoDB, we should sync them
      // This can happen on first-time login after Supabase registration
      user = await User.create({
        name: req.user.user_metadata?.name || 'User',
        email: req.user.email,
        phone: req.user.user_metadata?.phone,
        supabase_id: req.user.id,
        role: 'user'
      })
    } else if (!user.supabase_id) {
       // Link existing MongoDB user to their Supabase ID
       user.supabase_id = req.user.id
       await user.save()
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' })
    }

    // Replace req.user (Supabase object) with the MongoDB user object
    req.user = user
    next()
  } catch (err) {
    console.error('Auth Middleware Error:', err)
    return res.status(401).json({ message: 'Invalid or expired session' })
  }
}

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

exports.signToken = (userId) => {
  // signToken is no longer needed for Supabase auth, but we keep it for compatibility if needed
  return 'supabase-managed-token'
}
