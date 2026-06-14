import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  adminUpdateStatusAPI,
  adminAddRemarkAPI,
  getComplaintAPI,
} from '../api/complaintAPI'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'
import {
  User, Calendar, Tag, SlidersHorizontal,
  MessageSquare, Paperclip, CheckCircle, Send,
} from 'lucide-react'
import { format } from 'date-fns'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">{label}</p>
    <div className="text-sm text-ink">{children}</div>
  </div>
)

export default function AdminComplaintView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [remark, setRemark]         = useState('')
  const [savingRemark, setSavingRemark] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    getComplaintAPI(id)
      .then(res => setComplaint(res.data.complaint))
      .catch(() => toast.error('Failed to load complaint'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus) => {
    if (!complaint || newStatus === complaint.status) return
    setSavingStatus(true)
    try {
      const res = await adminUpdateStatusAPI(id, newStatus)
      setComplaint(res.data.complaint)
      toast.success(`Status updated to "${newStatus}"`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAddRemark = async () => {
    if (!remark.trim()) return
    setSavingRemark(true)
    try {
      const res = await adminAddRemarkAPI(id, remark.trim())
      setComplaint(res.data.complaint)
      setRemark('')
      toast.success('Remark added')
    } catch {
      toast.error('Failed to add remark')
    } finally {
      setSavingRemark(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-3xl">
        <div className="h-8 bg-surface-tertiary rounded w-1/3" />
        <div className="card p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-tertiary rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!complaint) return null

  return (
    <div className="max-w-3xl animate-fade-in">
      <PageHeader
        title="Complaint Detail"
        subtitle={`#${complaint._id.slice(-6).toUpperCase()}`}
        back
      />

      <div className="space-y-5">
        {/* Main info card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="font-display text-lg font-bold text-ink leading-snug">
              {complaint.title}
            </h2>
            <PriorityBadge priority={complaint.priority} />
          </div>

          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            {complaint.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 border-t border-surface-border pt-5">
            <Field label="Submitted By">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-ink-light" />
                {complaint.user?.name || 'Unknown'}
              </span>
            </Field>
            <Field label="Email">
              {complaint.user?.email || '—'}
            </Field>
            <Field label="Category">
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-ink-light" />
                {complaint.category}
              </span>
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
            <Field label="Current Status">
              <StatusBadge status={complaint.status} />
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

        {/* Update Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Update Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={savingStatus}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                  complaint.status === s
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                    : 'border-surface-border text-ink-muted hover:bg-surface-secondary hover:text-ink'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {complaint.status === s && (
                  <CheckCircle size={12} className="inline mr-1" />
                )}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Remarks */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <MessageSquare size={15} />
            Admin Remarks
          </h3>

          {/* Existing remark */}
          {complaint.adminRemark ? (
            <div className="bg-surface-secondary rounded-lg p-4 mb-4 border border-surface-border">
              <p className="text-sm text-ink leading-relaxed">{complaint.adminRemark}</p>
              <p className="text-xs text-ink-light mt-2">Last updated {format(new Date(complaint.updatedAt), 'dd MMM yyyy')}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted mb-4">No remarks yet. Add one below.</p>
          )}

          {/* Add / edit remark */}
          <div className="space-y-3">
            <textarea
              rows={3}
              placeholder="Add an internal remark or resolution notes…"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              className="textarea"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddRemark}
                disabled={!remark.trim() || savingRemark}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingRemark
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={15} />
                }
                {savingRemark ? 'Saving…' : 'Save Remark'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}