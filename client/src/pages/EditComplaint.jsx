import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getComplaintAPI, updateComplaintAPI } from '../api/complaintAPI'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'
import { Upload, X, Send, ImageIcon } from 'lucide-react'

const CATEGORIES = ['Technology', 'Billing', 'HR', 'Infrastructure', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function EditComplaint() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'Medium',
  })
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [errors, setErrors]       = useState({})
  const [charCount, setCharCount] = useState(0)

  // Load existing complaint
  useEffect(() => {
    getComplaintAPI(id)
      .then(res => {
        const c = res.data.complaint
        if (c.status !== 'Open') {
          toast.error('Only Open complaints can be edited.')
          navigate(`/complaints/${id}`)
          return
        }
        setForm({
          title:       c.title,
          description: c.description,
          category:    c.category,
          priority:    c.priority,
        })
        setCharCount(c.description.length)
        if (c.attachment) setExistingFile(c.attachment)
      })
      .catch(() => {
        toast.error('Failed to load complaint.')
        navigate('/complaints')
      })
      .finally(() => setFetching(false))
  }, [id, navigate])

  const validate = () => {
    const e = {}
    if (!form.title.trim())         e.title       = 'Title is required'
    else if (form.title.length > 200) e.title     = 'Max 200 characters'
    if (!form.description.trim())   e.description = 'Description is required'
    if (!form.category)             e.category    = 'Please select a category'
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
    setExistingFile(null)
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setExistingFile(null)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('attachment', file)

      await updateComplaintAPI(id, fd)
      toast.success('Complaint updated successfully!')
      navigate(`/complaints/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update complaint')
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    Low:      'border-gray-200 bg-gray-50 text-gray-700',
    Medium:   'border-blue-200 bg-blue-50 text-blue-700',
    High:     'border-orange-200 bg-orange-50 text-orange-700',
    Critical: 'border-red-200 bg-red-50 text-red-700',
  }

  if (fetching) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-8 bg-surface-tertiary rounded w-1/3" />
        <div className="card p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-surface-tertiary rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl animate-slide-up">
      <PageHeader
        title="Edit Complaint"
        subtitle="Update the details of your complaint"
        back
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Info */}
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
            placeholder="Describe your complaint in detail…"
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

          {/* Existing attachment from server */}
          {existingFile && !file && (
            <div className="relative rounded-xl border border-surface-border bg-surface-secondary p-4 flex items-center gap-4 mb-3">
              {existingFile.match(/\.(jpg|jpeg|png|gif)$/i)
                ? <img src={existingFile} alt="current attachment" className="w-16 h-16 rounded-lg object-cover border border-surface-border" />
                : <div className="w-16 h-16 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <ImageIcon size={24} className="text-brand-400" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">Current attachment</p>
                <p className="text-xs text-ink-light mt-0.5">Replace by uploading a new file</p>
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

          {/* New file selected */}
          {file ? (
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
          ) : !existingFile && (
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
          )}

          {/* Show upload button even when existing file is present */}
          {existingFile && !file && (
            <label
              htmlFor="attachment-replace"
              className="mt-3 flex items-center justify-center gap-2 border border-dashed border-surface-border rounded-xl py-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all text-sm text-ink-muted hover:text-brand-600"
            >
              <Upload size={15} />
              Upload replacement file
              <input
                id="attachment-replace"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
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
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}