const config = {
  'Low':      { cls: 'priority-low',      label: '↓ Low' },
  'Medium':   { cls: 'priority-medium',   label: '→ Medium' },
  'High':     { cls: 'priority-high',     label: '↑ High' },
  'Critical': { cls: 'priority-critical', label: '⚡ Critical' },
}

export default function PriorityBadge({ priority }) {
  const c = config[priority] || config['Low']
  return <span className={c.cls}>{c.label}</span>
}