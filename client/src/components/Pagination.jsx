import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  let rendered = []
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) {
      rendered.push('...')
    }
    rendered.push(p)
  })

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {rendered.map((p, i) =>
        p === '...'
          ? <span key={`dots-${i}`} className="px-2 text-ink-light text-sm">…</span>
          : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx(
                'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'hover:bg-surface-tertiary text-ink-muted'
              )}
            >
              {p}
            </button>
          )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}