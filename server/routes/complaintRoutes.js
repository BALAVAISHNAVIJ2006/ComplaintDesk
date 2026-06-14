const router = require('express').Router()
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  adminGetAllComplaints,
  adminUpdateStatus,
  adminAddRemark,
} = require('../controllers/complaintController')
const { protect }    = require('../middleware/authMiddleware')
const { adminOnly }  = require('../middleware/roleMiddleware')
const { uploadSingle } = require('../middleware/uploadMiddleware')

// All complaint routes require authentication
router.use(protect)

// ─── Admin routes (must come before /:id to avoid param conflicts) ────────────
router.get('/admin/all',              adminOnly, adminGetAllComplaints)
router.put('/admin/:id/status',       adminOnly, adminUpdateStatus)
router.put('/admin/:id/remark',       adminOnly, adminAddRemark)

// ─── User routes ──────────────────────────────────────────────────────────────
router.post('/',     uploadSingle('attachment'), createComplaint)
router.get('/my',    getMyComplaints)
router.get('/:id',   getComplaint)
router.put('/:id',   uploadSingle('attachment'), updateComplaint)
router.delete('/:id', deleteComplaint)

module.exports = router
