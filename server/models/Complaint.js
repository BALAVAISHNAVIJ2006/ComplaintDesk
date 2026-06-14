const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
  {
    // ── Core fields ───────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Technology', 'Billing', 'HR', 'Infrastructure', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved', 'Closed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Open',
    },

    // ── Relations ─────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Attachment ────────────────────────────────────────────────────────────
    attachment: {
      type: String,   // relative URL: /uploads/<filename>
      default: null,
    },

    // ── Admin fields ──────────────────────────────────────────────────────────
    adminRemark: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remark cannot exceed 1000 characters'],
      default: null,
    },
  },
  { timestamps: true }
)

// ── Indexes for common query patterns ────────────────────────────────────────
complaintSchema.index({ user: 1, createdAt: -1 })
complaintSchema.index({ status: 1 })
complaintSchema.index({ priority: 1 })
complaintSchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.model('Complaint', complaintSchema)
