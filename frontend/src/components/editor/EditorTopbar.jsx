import { useState } from 'react'
import { ChevronLeft, Download, Undo2, Redo2, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { Badge, STATUS_VARIANT } from '@/components/ui/Badge'
import { APP_NAME, QUERY_KEYS } from '@/config/constants'
import { useMutation } from '@tanstack/react-query'
import { updateProject } from '@/services/projectService'
import { queryClient } from '@/lib/queryClient'
import { useEditorStore } from '@/store/editorStore'

/**
 * @param {{ project: import('@/types/project').Project, onExport: () => void }} props
 */
export function EditorTopbar({ project, onExport }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)

  const canUndo = useEditorStore((s) => s.undoStack.length > 0)
  const canRedo = useEditorStore((s) => s.redoStack?.length > 0)
  const undo    = useEditorStore((s) => s.undo)
  const redo    = useEditorStore((s) => s.redo)

  const mutation = useMutation({
    mutationFn: (newName) => updateProject(project.id, { name: newName }),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.project(project.id), updated)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })
    },
  })

  const handleSave = () => {
    setIsEditing(false)
    const trimmed = name.trim()
    if (trimmed && trimmed !== project.name) {
      mutation.mutate(trimmed)
    } else {
      setName(project.name)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setIsEditing(false); setName(project.name) }
  }

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const canExport = ['completed', 'ready'].includes(project.status)

  return (
    <div
      className="h-14 shrink-0 flex items-center justify-between px-4 border-b relative z-20 backdrop-blur-md"
      style={{
        background: 'rgba(10, 10, 11, 0.85)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Left — back + brand */}
      <div className="flex items-center gap-2">
        <Link
          to={ROUTES.dashboard}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="w-px h-5 mx-1.5" style={{ background: 'var(--color-border-strong)' }} />

        <span className="font-bold text-[13px] tracking-tight hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
          {APP_NAME}
        </span>
      </div>

      {/* Center — project name + badge */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-[13px] font-semibold px-2.5 py-1 rounded-md outline-none transition-all shadow-sm focus:ring-2 focus:ring-[var(--color-primary-muted)]"
            style={{
              background:  'var(--color-bg-elevated)',
              border:      '1px solid var(--color-border-focus)',
              color:       'var(--color-text-primary)',
              minWidth: 160,
            }}
            aria-label="Rename project"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium transition-colors hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5"
            style={{ color: 'var(--color-text-primary)' }}
            title="Click to rename"
          >
            {project.name}
          </button>
        )}

        <Badge variant={STATUS_VARIANT[project.status] ?? 'default'} dot className="hidden sm:flex ml-2">
          {statusLabel}
        </Badge>

        {project.language && (
          <Badge variant="outline" className="hidden md:flex uppercase text-[10px] ml-1">
            {project.language}
          </Badge>
        )}
      </div>

      {/* Right — undo/redo + export */}
      <div className="flex items-center gap-1">
        {canUndo !== undefined && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last edit"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo last edit"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
            <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
          </>
        )}
        <Button onClick={onExport} size="sm" disabled={!canExport}>
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>
    </div>
  )
}
