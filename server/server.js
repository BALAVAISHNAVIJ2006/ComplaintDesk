const express    = require('express')
const cors       = require('cors')
const dotenv     = require('dotenv')
const path       = require('path')
const connectDB  = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Static: serve uploaded files ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'))
app.use('/api/complaints', require('./routes/complaintRoutes'))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`))
