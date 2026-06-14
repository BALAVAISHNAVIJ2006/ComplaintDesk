const multer = require('multer')
const path   = require('path')
const crypto = require('crypto')

// ── Storage: save to /uploads with a random filename ─────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const ext    = path.extname(file.originalname).toLowerCase()
    const unique = crypto.randomBytes(16).toString('hex')
    cb(null, `${Date.now()}-${unique}${ext}`)
  },
})

// ── File filter: images + PDF only ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, GIF, or PDF files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5 MB
  },
})

/**
 * uploadSingle('attachment') — handles one optional file field.
 * Wraps multer errors into a clean JSON response.
 */
const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next()

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' })
      }
      return res.status(400).json({ message: err.message })
    }
    // fileFilter rejection
    return res.status(400).json({ message: err.message })
  })
}

module.exports = { uploadSingle }
