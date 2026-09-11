import { useRef, useEffect, memo, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePlayerStore } from '@/store/playerStore'
import { useEditorStore } from '@/store/editorStore'
import { CaptionInlineEdit } from '@/components/captions/CaptionInlineEdit'
import './CaptionItem.css'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00.0'
  const m  = Math.floor(seconds / 60)
  const s  = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`
}

export const CaptionItem = memo(function CaptionItem({
  caption,
  index,
  isActive,
  isSelected,
  onDeleteRequest,
  onEdit,
}) {
  const itemRef    = useRef(null)
  const [isEditing, setIsEditing] = useState(false)

  const requestSeek       = usePlayerStore((s) => s.requestSeek)
  const isPlaying         = usePlayerStore((s) => s.isPlaying)
  const setSelectedCaption = useEditorStore((s) => s.setSelectedCaption)

  useEffect(() => {
    if (isActive && isPlaying && itemRef.current && !isEditing) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive, isPlaying, isEditing])

  useEffect(() => {
    if (isSelected && !isPlaying && itemRef.current && !isEditing) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected, isPlaying, isEditing])

  const handleClick = () => {
    if (isEditing) return
    setSelectedCaption(caption.id)
    requestSeek(caption.start)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleSave = (newText) => {
    if (newText.trim() !== caption.text) {
      onEdit(caption.id, { text: newText.trim() }, caption.text)
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={itemRef}
      onClick={handleClick}
      data-editing={isEditing}
      className={cn('caption-item', isActive && 'is-active', isSelected && 'is-selected')}
    >
      <div className="caption-meta">
        <span className="caption-index">#{index + 1}</span>
        <span className="caption-time">{formatTime(caption.start)}</span>
        <span className="caption-time">{formatTime(caption.end)}</span>
      </div>

      <div className="caption-content" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <CaptionInlineEdit
            initialText={caption.text}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="caption-text">{caption.text}</p>
        )}
      </div>

      {!isEditing && (
        <div className="caption-actions">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
            className="caption-action-btn"
            aria-label="Edit caption"
          >
            <Pencil width={12} height={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteRequest(caption.id) }}
            className="caption-action-btn danger"
            aria-label="Delete caption"
          >
            <Trash2 width={12} height={12} />
          </button>
        </div>
      )}
    </div>
  )
})
