import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, back, actions }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between gap-4 mb-8 animate-fade-in">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-surface-border transition-all flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-ink-muted" />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}