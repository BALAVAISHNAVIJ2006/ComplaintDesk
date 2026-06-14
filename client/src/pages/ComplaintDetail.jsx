import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getComplaintAPI, deleteComplaintAPI } from '../api/complaintAPI'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'
import {
  Calendar, Tag, Paperclip, Pencil, Trash2,
  MessageSquare, AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">{label}</p>
    <div className="text-sm text-ink">{children}</div>
  </div>
)

export default function ComplaintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    getComplaintAPI(id)
      .then(res => setComplaint(res.data.complaint))
      .catch(() => toast.error('Complaint not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteComplaintAPI(id)
      toast.success('Complaint deleted')
      navigate('/complaints')
    } catch {
      toast.error('Failed to delete complaint')
      setDeleting(false)
    }
  }

  const canEdit = complaint && ['Open'].includes(complaint.status)

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 bg-surface-tertiary rounded w-1/3" />
        <div className="card p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-tertiary rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!complaint) return null

  return (
    <div className="max-w-2xl animate-fade-in">
      <PageHeader
        title="Complaint Detail"
        subtitle={`#${complaint._id.slice(-6).toUpperCase()}`}
        back
        actions={
          canEdit && (
            <div className="flex items-center gap-2">
              <Link to={`/complaints/${id}/edit`} className="btn-secondary">
                <Pencil size={15} />
                Edit
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )
        }
      />

      <div className="space-y-5">
        {/* Main card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="font-display text-lg font-bold text-ink leading-snug">
              {complaint.title}
            </h2>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <div className="mb-6">
            <StatusBadge status={complaint.status} />
          </div>

          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            {complaint.description}
          </p>

          <div className="grid grid-cols-2 gap-5 border-t border-surface-border pt-5">
            <Field label="Category">
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-ink-light" />
                {complaint.category}
              </span>
            </Field>
            <Field label="Priority">
              <PriorityBadge priority={complaint.priority} />
            </Field>
            <Field label="Submitted">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-ink-light" />
                {format(new Date(complaint.createdAt), 'dd MMM yyyy, HH:mm')}
              </span>
            </Field>
            <Field label="Last Updated">
              {format(new Date(complaint.updatedAt), 'dd MMM yyyy, HH:mm')}
            </Field>
          </div>
        </div>

        {/* Attachment */}
        {complaint.attachment && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Paperclip size={15} />
              Attachment
            </h3>
            {complaint.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={complaint.attachment}
                alt="attachment"
                className="rounded-lg max-h-64 object-cover border border-surface-border"
              />
            ) : (
              <a
                href={complaint.attachment}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium underline-offset-2 hover:underline"
              >
                View PDF document
              </a>
            )}
          </div>
        )}

        {/* Admin remark */}
        {complaint.adminRemark && (
          <div className="card p-5 border-brand-100 bg-brand-50/40">
            <h3 className="text-sm font-semibold text-brand-700 mb-3 flex items-center gap-2">
              <MessageSquare size={15} />
              Admin Response
            </h3>
            <p className="text-sm text-ink leading-relaxed">{complaint.adminRemark}</p>
          </div>
        )}

        {/* Status note */}
        {!canEdit && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              This complaint is <span className="font-semibold">{complaint.status}</span> and can no longer be edited.
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-panel p-6 max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-base font-bold text-ink mb-2">Delete Complaint?</h3>
            <p className="text-sm text-ink-muted mb-6">
              This action cannot be undone. The complaint and all its data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 size={15} />
                }
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}