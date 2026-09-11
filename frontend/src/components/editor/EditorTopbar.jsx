import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Download, Undo2, Redo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { Badge, STATUS_VARIANT } from '@/components/ui/Badge'
import { APP_NAME, QUERY_KEYS } from '@/config/constants'
import { useMutation } from '@tanstack/react-query'
import { updateProject } from '@/services/projectService'
import { queryClient } from '@/lib/queryClient'
import { useEditorStore } from '@/store/editorStore'
import './EditorTopbar.css'

export function EditorTopbar({ project, onExport }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)

  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const undo    = useEditorStore((s) => s.undo)
  const redo    = useEditorStore((s) => s.redo)

  const handleUndo = useCallback(() => undo(project.id), [undo, project.id])
  const handleRedo = useCallback(() => redo(project.id), [redo, project.id])

  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
    }
    const onKey = (e) => {
      if (isTyping()) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && !e.shiftKey && e.key === 'z') { e.preventDefault(); handleUndo() }
      if (mod && e.shiftKey  && e.key === 'z') { e.preventDefault(); handleRedo() }
      if (mod && e.key === 'y')                 { e.preventDefault(); handleRedo() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleUndo, handleRedo])

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
    if (trimmed && trimmed !== project.name) mutation.mutate(trimmed)
    else setName(project.name)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setIsEditing(false); setName(project.name) }
  }

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const canExport   = ['completed', 'ready'].includes(project.status)

  return (
    <div className="editor-topbar">

      <div className="editor-topbar-left">
        <Link to={ROUTES.dashboard} className="editor-back-btn" aria-label="Back to dashboard">
          <ChevronLeft width={16} height={16} />
        </Link>
        <span className="editor-topbar-divider" />
        <span className="editor-brand">{APP_NAME}</span>
      </div>

      <div className="editor-topbar-center">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="editor-project-name-input"
            aria-label="Rename project"
          />
        ) : (
          <button onClick={() => setIsEditing(true)} className="editor-project-name-btn" title="Click to rename">
            {project.name}
          </button>
        )}

        <Badge variant={STATUS_VARIANT[project.status] ?? 'default'} dot>
          {statusLabel}
        </Badge>

        {project.language && (
          <Badge variant="outline" className="hidden md:flex uppercase" style={{ fontSize: 10 }}>
            {project.language}
          </Badge>
        )}
      </div>

      <div className="editor-topbar-right">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 width={13} height={13} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <Redo2 width={13} height={13} />
        </Button>
        <span className="editor-action-divider" />
        <Button onClick={onExport} size="sm" disabled={!canExport}>
          <Download width={13} height={13} />
          Export
        </Button>
      </div>
    </div>
  )
}
