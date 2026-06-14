import { Search, SlidersHorizontal, X } from 'lucide-react'

const STATUSES   = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical']
const CATEGORIES = ['All', 'Technology', 'Billing', 'HR', 'Infrastructure', 'Other']

export default function FilterBar({ filters, onChange, onReset }) {
  const hasActive = filters.status !== 'All' || filters.priority !== 'All' || filters.search

  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
        <input
          type="text"
          placeholder="Search complaints…"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="input pl-9"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={e => onChange({ ...filters, status: e.target.value })}
          className="select pr-9 min-w-[140px]"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
        <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
      </div>

      {/* Priority filter */}
      <div className="relative">
        <select
          value={filters.priority}
          onChange={e => onChange({ ...filters, priority: e.target.value })}
          className="select pr-9 min-w-[150px]"
        >
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>
          ))}
        </select>
        <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
      </div>

      {/* Category filter */}
      <div className="relative">
        <select
          value={filters.category || 'All'}
          onChange={e => onChange({ ...filters, category: e.target.value })}
          className="select pr-9 min-w-[160px]"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
          ))}
        </select>
        <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
      </div>

      {/* Date filter (single day) */}
      <div className="relative">
        <input
          type="date"
          value={filters.date || ''}
          onChange={e => onChange({ ...filters, date: e.target.value })}
          className="input pr-9 min-w-[150px]"
        />
      </div>

      {/* Reset */}
      {hasActive && (
        <button onClick={onReset} className="btn-ghost gap-1.5 text-ink-muted whitespace-nowrap">
          <X size={14} />
          Reset
        </button>
      )}
    </div>
  )
}