const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id)
  res.status(statusCode).json({ token, user })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name: name.trim(), email, password })

    sendAuthResponse(res, 201, user)
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ message: messages[0] })
    }
    console.error('[register]', err)
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // Explicitly select password back (it is hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    sendAuthResponse(res, 200, user)
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ message: 'Login failed. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (err) {
    console.error('[getMe]', err)
    res.status(500).json({ message: 'Could not fetch profile.' })
  }
}
