import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createComplaintAPI } from '../api/complaintAPI'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'
import { Upload, X, Send, ImageIcon } from 'lucide-react'

const CATEGORIES = ['Technology', 'Billing', 'HR', 'Infrastructure', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function RaiseComplaint() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'Medium',
  })
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [charCount, setCharCount] = useState(0)

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    else if (form.title.length > 200) e.title   = 'Max 200 characters'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category)           e.category    = 'Please select a category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowed.includes(f.type)) {
      toast.error('Only JPG, PNG, GIF, or PDF files allowed')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5 MB')
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('attachment', file)

      await createComplaintAPI(fd)
      toast.success('Complaint submitted successfully!')
      navigate('/complaints')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    Low: 'border-gray-200 bg-gray-50 text-gray-700',
    Medium: 'border-blue-200 bg-blue-50 text-blue-700',
    High: 'border-orange-200 bg-orange-50 text-orange-700',
    Critical: 'border-red-200 bg-red-50 text-red-700',
  }

  return (
    <div className="max-w-2xl animate-slide-up">
      <PageHeader
        title="Raise a Complaint"
        subtitle="Fill in the details below to submit your complaint"
        back
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink mb-4 text-sm">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="title">Complaint Title *</label>
              <input
                id="title"
                type="text"
                maxLength={200}
                placeholder="Short, descriptive title…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={`input ${errors.title ? 'border-red-300' : ''}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="category">Category *</label>
                <div className="relative">
                  <select
                    id="category"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`select pr-8 ${errors.category ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="label">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        form.priority === p
                          ? priorityColors[p] + ' ring-1 ring-current'
                          : 'border-surface-border text-ink-muted hover:bg-surface-tertiary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink text-sm">Description *</h2>
            <span className={`text-xs ${charCount > 1900 ? 'text-red-500' : 'text-ink-light'}`}>
              {charCount}/2000
            </span>
          </div>
          <textarea
            rows={6}
            placeholder="Describe your complaint in detail. Include what happened, when it happened, and any relevant context…"
            maxLength={2000}
            value={form.description}
            onChange={e => {
              setForm(f => ({ ...f, description: e.target.value }))
              setCharCount(e.target.value.length)
            }}
            className={`textarea ${errors.description ? 'border-red-300' : ''}`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Attachment */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink mb-4 text-sm">Attachment (optional)</h2>
          {!file ? (
            <label
              htmlFor="attachment"
              className="flex flex-col items-center justify-center border-2 border-dashed border-surface-border rounded-xl py-10 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-tertiary group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                <Upload size={22} className="text-ink-light group-hover:text-brand-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-ink-muted group-hover:text-brand-600 transition-colors">
                Click to upload screenshot or PDF
              </p>
              <p className="text-xs text-ink-light mt-1">JPG, PNG, GIF, PDF — max 5 MB</p>
              <input
                id="attachment"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative rounded-xl border border-surface-border bg-surface-secondary p-4 flex items-center gap-4">
              {preview
                ? <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-surface-border" />
                : <div className="w-16 h-16 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <ImageIcon size={24} className="text-brand-400" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                <p className="text-xs text-ink-light mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-ink-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} />
            }
            {loading ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}