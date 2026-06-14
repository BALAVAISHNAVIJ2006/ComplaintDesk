import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMyComplaintsAPI } from '../api/complaintAPI'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { formatDistanceToNow } from 'date-fns'
import { Search, FilePlus, ChevronRight, SlidersHorizontal } from 'lucide-react'

const STATUSES   = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical']
const LIMIT = 10

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState('All')
  const [priority, setPriority]     = useState('All')

  const totalPages = Math.ceil(total / LIMIT)

  const fetchComplaints = useCallback(() => {
    setLoading(true)
    const params = { page, limit: LIMIT }
    if (search)           params.search   = search
    if (status !== 'All') params.status   = status
    if (priority !== 'All') params.priority = priority

    getMyComplaintsAPI(params)
      .then(res => {
        setComplaints(res.data.complaints || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, status, priority])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, status, priority])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Complaints"
        subtitle={`${total} complaint${total !== 1 ? 's' : ''} found`}
        actions={
          <Link to="/complaints/new" className="btn-primary">
            <FilePlus size={17} />
            Raise New
          </Link>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
          <input
            type="text"
            placeholder="Search your complaints…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="relative">
          <select value={status} onChange={e => setStatus(e.target.value)} className="select pr-8 min-w-[140px]">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <SlidersHorizontal size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
        </div>
        <div className="relative">
          <select value={priority} onChange={e => setPriority(e.target.value)} className="select pr-8 min-w-[150px]">
            {PRIORITIES.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
          </select>
          <SlidersHorizontal size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card divide-y divide-surface-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-surface-tertiary rounded w-2/3" />
                <div className="h-3 bg-surface-tertiary rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-surface-tertiary rounded-full" />
                  <div className="h-5 w-20 bg-surface-tertiary rounded-full" />
                </div>
              </div>
              <div className="h-5 w-5 bg-surface-tertiary rounded mt-4" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={search || status !== 'All' || priority !== 'All'
            ? 'Try adjusting your filters to see results.'
            : 'You have not raised any complaints yet.'}
          action="Raise Complaint"
          actionTo="/complaints/new"
        />
      ) : (
        <>
          <div className="card overflow-hidden divide-y divide-surface-border">
            {complaints.map(c => (
              <Link
                key={c._id}
                to={`/complaints/${c._id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink group-hover:text-brand-700 transition-colors truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-ink-light mt-0.5 truncate">{c.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-ink-light">
                      · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-light flex-shrink-0 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}