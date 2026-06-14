const jwt  = require('jsonwebtoken')
const User = require('../models/User')

/**
 * protect — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    // Accept token from Authorization header: Bearer <token>
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach fresh user (exclude password)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

module.exports = { protect }
