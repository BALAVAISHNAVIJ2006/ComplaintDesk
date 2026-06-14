import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, Paperclip } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function ComplaintCard({ complaint, to, showUser = false }) {
  const c = complaint

  return (
    <Link
      to={to || `/complaints/${c._id}`}
      className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors group"
    >
      {/* Left: text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-ink group-hover:text-brand-700 transition-colors truncate">
            {c.title}
          </p>
          {c.attachment && (
            <Paperclip size={12} className="text-ink-light flex-shrink-0" />
          )}
        </div>

        {showUser && c.user && (
          <p className="text-xs text-ink-muted mb-0.5">
            By <span className="font-medium">{c.user.name}</span>
          </p>
        )}

        <p className="text-xs text-ink-light truncate mb-2">{c.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          <span className="text-xs text-ink-light">
            · {c.category}
          </span>
          <span className="text-xs text-ink-light">
            · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Right: chevron */}
      <ChevronRight
        size={16}
        className="text-ink-light flex-shrink-0 group-hover:text-brand-500 transition-colors"
      />
    </Link>
  )
}