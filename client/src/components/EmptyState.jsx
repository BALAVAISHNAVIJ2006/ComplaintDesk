import { FilePlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmptyState({ title, description, action, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
        <FilePlus size={28} className="text-brand-400" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-xs mb-5">{description}</p>
      {action && actionTo && (
        <Link to={actionTo} className="btn-primary">
          {action}
        </Link>
      )}
    </div>
  )
}