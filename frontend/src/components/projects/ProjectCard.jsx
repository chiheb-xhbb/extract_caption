import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, MoreVertical, Trash2, ExternalLink, Clock, Film } from 'lucide-react'
import { Badge, STATUS_VARIANT } from '@/components/ui/Badge'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/cn'

function formatDuration(seconds) {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * @param {{
 *   project: import('@/types/project').Project,
 *   onDelete: (id: number) => void,
 *   isDeleting: boolean
 * }} props
 */
const ProjectCard = memo(function ProjectCard({ project, onDelete, isDeleting }) {
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef(null)

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const duration    = formatDuration(project.duration)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div
      className={cn(
        'group relative rounded-2xl border flex flex-col overflow-hidden',
        'transition-all duration-[var(--duration-base)]',
        'hover:border-[var(--color-border-strong)]',
        isDeleting && 'opacity-40 pointer-events-none scale-95',
      )}
      style={{
        background:  'var(--color-bg-elevated)',
        borderColor: 'var(--color-border)',
        boxShadow:   'var(--shadow-xs)',
      }}
    >
      {/* Thumbnail / placeholder */}
      <div
        className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--color-bg-overlay)' }}
      >
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Film className="w-8 h-8" style={{ color: 'var(--color-text-disabled)' }} />
          </div>
        )}

        {/* Hover overlay */}
        <button
          onClick={() => navigate(ROUTES.editor(project.id))}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          aria-label={`Open ${project.name} in editor`}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-transform scale-95 group-hover:scale-100"
            style={{ background: 'var(--color-primary)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Editor
          </div>
        </button>

        {/* Duration badge */}
        {duration && (
          <span
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            <Clock className="w-3 h-3" />
            {duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-semibold leading-snug line-clamp-1 flex-1"
            style={{ color: 'var(--color-text-primary)' }}
            title={project.name}
          >
            {project.name}
          </h3>

          {/* Actions menu */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Project options"
              aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-9 w-40 rounded-xl border py-1 animate-scale-in"
                style={{
                  background:  'var(--color-bg-overlay)',
                  borderColor: 'var(--color-border)',
                  boxShadow:   'var(--shadow-lg)',
                  zIndex:      'var(--z-dropdown)',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onDelete(project.id)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={STATUS_VARIANT[project.status] ?? 'default'} dot>
            {statusLabel}
          </Badge>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(project.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
})

export { ProjectCard }
