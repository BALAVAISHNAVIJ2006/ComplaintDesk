import { Circle } from 'lucide-react'

const config = {
  'Open':        { cls: 'badge-open',        dot: 'bg-amber-500',  label: 'Open' },
  'In Progress': { cls: 'badge-in-progress', dot: 'bg-blue-500',   label: 'In Progress' },
  'Resolved':    { cls: 'badge-resolved',    dot: 'bg-green-500',  label: 'Resolved' },
  'Closed':      { cls: 'badge-closed',      dot: 'bg-gray-400',   label: 'Closed' },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config['Open']
  return (
    <span className={c.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'In Progress' ? 'animate-pulse-dot' : ''}`} />
      {c.label}
    </span>
  )
}