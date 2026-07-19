import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, MoreVertical, Trash2, ExternalLink, Clock } from 'lucide-react'
import { Badge, STATUS_VARIANT } from '@/components/ui/Badge'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/cn'
import './ProjectCard.css'

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
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(iso))
}

const ProjectCard = memo(function ProjectCard({ project, onDelete, isDeleting }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const duration    = formatDuration(project.duration)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div className={cn('project-card', isDeleting && 'deleting')}>

      {/* Thumbnail */}
      <div className="project-card-thumb">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.name} />
        ) : (
          <div className="project-card-thumb-placeholder">
            <Film width={28} height={28} />
          </div>
        )}

        <button
          onClick={() => navigate(ROUTES.editor(project.id))}
          className="project-card-open-overlay"
          aria-label={`Open ${project.name} in editor`}
        >
          <div className="project-card-open-pill">
            <ExternalLink width={13} height={13} />
            Open Editor
          </div>
        </button>

        {duration && (
          <span className="project-card-duration">
            <Clock width={10} height={10} />
            {duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="project-card-body">
        <div className="project-card-title-row">
          <h3 className="project-card-name" title={project.name}>
            {project.name}
          </h3>

          <div ref={menuRef} className="project-card-menu-wrap">
            <button
              className="project-card-menu-btn"
              aria-label="Project options"
              aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            >
              <MoreVertical width={14} height={14} />
            </button>

            {menuOpen && (
              <div className="project-card-dropdown">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project.id) }}
                  className="project-card-dropdown-item danger"
                >
                  <Trash2 width={13} height={13} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="project-card-meta">
          <Badge variant={STATUS_VARIANT[project.status] ?? 'default'} dot>
            {statusLabel}
          </Badge>
          <span className="project-card-date">{formatDate(project.created_at)}</span>
        </div>
      </div>
    </div>
  )
})

export { ProjectCard }
