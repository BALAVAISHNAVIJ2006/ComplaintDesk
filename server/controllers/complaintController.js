const path      = require('path')
const fs        = require('fs')
const Complaint = require('../models/Complaint')
const User      = require('../models/User')

// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Build a MongoDB filter object from query params.
 * Used by both user (scoped) and admin (global) list endpoints.
 */
const buildFilter = async ({ search, status, priority, category, date }, userId = null) => {
  const filter = {}

  if (userId) filter.user = userId

  if (status && status !== 'All') filter.status = status
  if (priority && priority !== 'All') filter.priority = priority
  if (category && category !== 'All') filter.category = category

  // Date filter: expect YYYY-MM-DD (single day). Builds a range for that day.
  if (date) {
    const d = new Date(date)
    if (!isNaN(d)) {
      const start = new Date(d.setHours(0, 0, 0, 0))
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      filter.createdAt = { $gte: start, $lt: end }
    }
  }

  if (search && search.trim()) {
    const q = search.trim()

    // Find users whose name or email match the search term
    const matchingUsers = await User.find({
      $or: [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('_id').limit(50)

    const userIds = matchingUsers.map(u => u._id)

    const orClauses = [
      { title:       { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ]

    if (userIds.length) orClauses.push({ user: { $in: userIds } })

    filter.$or = orClauses
  }

  return filter
}

/** Delete a local upload file safely (no-throw). */
const removeFile = (filePath) => {
  if (!filePath) return
  const abs = path.join(__dirname, '..', filePath.replace(/^\//, ''))
  fs.unlink(abs, () => {})
}

// ─────────────────────────────────────────────────────────────────────────────
//  USER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required.' })
    }

    const data = {
      title:       title.trim(),
      description: description.trim(),
      category,
      priority:    priority || 'Medium',
      user:        req.user._id,
    }

    if (req.file) {
      data.attachment = `/uploads/${req.file.filename}`
    }

    const complaint = await Complaint.create(data)
    await complaint.populate('user', 'name email')

    res.status(201).json({ complaint })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message
      return res.status(400).json({ message: msg })
    }
    console.error('[createComplaint]', err)
    res.status(500).json({ message: 'Failed to create complaint.' })
  }
}

// GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const skip  = (page - 1) * limit

    const filter = await buildFilter(req.query, req.user._id)

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ])

    res.json({ complaints, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[getMyComplaints]', err)
    res.status(500).json({ message: 'Failed to fetch complaints.' })
  }
}

// GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email')
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    // Users can only view their own complaints; admins can view all
    if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to view this complaint.' })
    }

    res.json({ complaint })
  } catch (err) {
    console.error('[getComplaint]', err)
    res.status(500).json({ message: 'Failed to fetch complaint.' })
  }
}

// PUT /api/complaints/:id   (owner can edit only while status = Open)
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to edit this complaint.' })
    }

    if (complaint.status !== 'Open') {
      return res.status(400).json({ message: 'Only Open complaints can be edited.' })
    }

    const { title, description, category, priority } = req.body

    if (title)       complaint.title       = title.trim()
    if (description) complaint.description = description.trim()
    if (category)    complaint.category    = category
    if (priority)    complaint.priority    = priority

    // Replace attachment if a new file was uploaded
    if (req.file) {
      removeFile(complaint.attachment)
      complaint.attachment = `/uploads/${req.file.filename}`
    }

    await complaint.save()
    await complaint.populate('user', 'name email')

    res.json({ complaint })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message
      return res.status(400).json({ message: msg })
    }
    console.error('[updateComplaint]', err)
    res.status(500).json({ message: 'Failed to update complaint.' })
  }
}

// DELETE /api/complaints/:id  (owner, only when Open)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this complaint.' })
    }

    if (complaint.status !== 'Open') {
      return res.status(400).json({ message: 'Only Open complaints can be deleted.' })
    }

    removeFile(complaint.attachment)
    await complaint.deleteOne()

    res.json({ message: 'Complaint deleted successfully.' })
  } catch (err) {
    console.error('[deleteComplaint]', err)
    res.status(500).json({ message: 'Failed to delete complaint.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/complaints/admin/all
exports.adminGetAllComplaints = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 15)
    const skip  = (page - 1) * limit

    const filter = await buildFilter(req.query)  // no userId scope for admin

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ])

    // Aggregate stats across ALL complaints (not just current page)
    const [statsResult] = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total:      { $sum: 1 },
          open:       { $sum: { $cond: [{ $eq: ['$status', 'Open'] },       1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved:   { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
        },
      },
    ])

    const stats = statsResult || { total: 0, open: 0, inProgress: 0, resolved: 0 }
    delete stats._id

    res.json({
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
    })
  } catch (err) {
    console.error('[adminGetAllComplaints]', err)
    res.status(500).json({ message: 'Failed to fetch complaints.' })
  }
}

// PUT /api/complaints/admin/:id/status
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}.` })
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email')

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    res.json({ complaint })
  } catch (err) {
    console.error('[adminUpdateStatus]', err)
    res.status(500).json({ message: 'Failed to update status.' })
  }
}

// PUT /api/complaints/admin/:id/remark
exports.adminAddRemark = async (req, res) => {
  try {
    const { remark } = req.body

    if (!remark || !remark.trim()) {
      return res.status(400).json({ message: 'Remark text is required.' })
    }

    if (remark.trim().length > 1000) {
      return res.status(400).json({ message: 'Remark cannot exceed 1000 characters.' })
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { adminRemark: remark.trim() },
      { new: true, runValidators: true }
    ).populate('user', 'name email')

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    res.json({ complaint })
  } catch (err) {
    console.error('[adminAddRemark]', err)
    res.status(500).json({ message: 'Failed to save remark.' })
  }
}
