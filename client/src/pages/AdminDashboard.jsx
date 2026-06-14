import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminGetAllComplaintsAPI } from '../api/complaintAPI'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import {
  Users, FolderOpen, Clock, CheckCircle,
  AlertTriangle, ChevronRight, Paperclip,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const LIMIT = 15

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  </div>
)

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [total, setTotal]           = useState(0)
  const [stats, setStats]           = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 })
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ search: '', status: 'All', priority: 'All', category: 'All', date: '' })

  const totalPages = Math.ceil(total / LIMIT)

  const fetchComplaints = useCallback(() => {
    setLoading(true)
    const params = { page, limit: LIMIT }
    if (filters.search)              params.search   = filters.search
    if (filters.status !== 'All')    params.status   = filters.status
    if (filters.priority !== 'All')  params.priority = filters.priority
    if (filters.category && filters.category !== 'All') params.category = filters.category
    if (filters.date)                 params.date     = filters.date

    adminGetAllComplaintsAPI(params)
      .then(res => {
        const data = res.data
        setComplaints(data.complaints || [])
        setTotal(data.total || 0)
        // Use aggregated stats if backend provides them, else derive from page
        if (data.stats) {
          setStats(data.stats)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filters])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [filters])

  const resetFilters = () => setFilters({ search: '', status: 'All', priority: 'All', category: 'All', date: '' })

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`${total} total complaint${total !== 1 ? 's' : ''}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total"       value={stats.total || total}        icon={FolderOpen}    color="text-brand-600"  bg="bg-brand-50" />
        <StatCard label="Open"        value={stats.open || 0}             icon={AlertTriangle} color="text-amber-600"  bg="bg-amber-50" />
        <StatCard label="In Progress" value={stats.inProgress || 0}       icon={Clock}         color="text-blue-600"   bg="bg-blue-50" />
        <StatCard label="Resolved"    value={stats.resolved || 0}         icon={CheckCircle}   color="text-green-600"  bg="bg-green-50" />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
        />
      </div>

      {/* Complaint list */}
      {loading ? (
        <div className="card divide-y divide-surface-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-surface-tertiary rounded w-2/3" />
                <div className="h-3 bg-surface-tertiary rounded w-1/3" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-surface-tertiary rounded-full" />
                  <div className="h-5 w-20 bg-surface-tertiary rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={
            filters.search || filters.status !== 'All' || filters.priority !== 'All'
              ? 'Try adjusting your filters.'
              : 'No complaints have been submitted yet.'
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden divide-y divide-surface-border">
            {complaints.map(c => (
              <Link
                key={c._id}
                to={`/admin/complaints/${c._id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-ink group-hover:text-brand-700 transition-colors truncate">
                      {c.title}
                    </p>
                    {c.attachment && (
                      <Paperclip size={12} className="text-ink-light flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mb-2">
                    By <span className="font-medium">{c.user?.name || 'Unknown'}</span>
                    {' · '}{c.category}
                    {' · '}{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-ink-light flex-shrink-0 group-hover:text-brand-500 transition-colors"
                />
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}