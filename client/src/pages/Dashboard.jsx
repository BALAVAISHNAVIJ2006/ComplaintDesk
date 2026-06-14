import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyComplaintsAPI } from '../api/complaintAPI'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import EmptyState from '../components/EmptyState'
import { FilePlus, FolderOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    getMyComplaintsAPI({ limit: 20 })
      .then(res => setComplaints(res.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
  }

  const recent = complaints.slice(0, 5)

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-muted mt-1">Here's an overview of your complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Complaints"  value={stats.total}      icon={FolderOpen}    color="text-brand-600"  bg="bg-brand-50" />
        <StatCard label="Open"              value={stats.open}       icon={AlertTriangle} color="text-amber-600"  bg="bg-amber-50" />
        <StatCard label="In Progress"       value={stats.inProgress} icon={Clock}         color="text-blue-600"   bg="bg-blue-50" />
        <StatCard label="Resolved"          value={stats.resolved}   icon={CheckCircle}   color="text-green-600"  bg="bg-green-50" />
      </div>

      {/* Quick action */}
      <div className="card p-6 mb-8 bg-gradient-to-br from-brand-600 to-brand-700 border-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Have an issue to report?</h2>
            <p className="text-brand-200 text-sm mt-0.5">Submit a complaint and track it in real time</p>
          </div>
          <Link to="/complaints/new" className="btn-secondary flex-shrink-0 shadow-sm">
            <FilePlus size={17} />
            Raise Complaint
          </Link>
        </div>
      </div>

      {/* Recent complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-ink">Recent Complaints</h2>
          <Link to="/complaints" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="card divide-y divide-surface-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 flex gap-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-tertiary rounded w-3/4" />
                  <div className="h-3 bg-surface-tertiary rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-surface-tertiary rounded-full" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Raise your first complaint to get started."
            action="Raise Complaint"
            actionTo="/complaints/new"
          />
        ) : (
          <div className="card divide-y divide-surface-border overflow-hidden">
            {recent.map(c => (
              <Link
                key={c._id}
                to={`/complaints/${c._id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.title}</p>
                  <p className="text-xs text-ink-light mt-0.5">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}