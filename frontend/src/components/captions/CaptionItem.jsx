import { useRef, useEffect, memo, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePlayerStore } from '@/store/playerStore'
import { CaptionInlineEdit } from '@/components/captions/CaptionInlineEdit'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00.0'
  const m  = Math.floor(seconds / 60)
  const s  = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`
}

/**
 * @param {{
 *   caption: import('@/types/caption').Caption,
 *   index: number,
 *   isActive: boolean,
 *   onDeleteRequest: (id: number) => void,
 *   onEdit: (id: number, payload: { text: string }, previousText: string) => void
 * }} props
 */
export const CaptionItem = memo(function CaptionItem({
  caption,
  index,
  isActive,
  onDeleteRequest,
  onEdit,
}) {
  const itemRef    = useRef(null)
  const [isEditing, setIsEditing] = useState(false)

  const requestSeek    = usePlayerStore((s) => s.requestSeek)
  const isPlaying      = usePlayerStore((s) => s.isPlaying)

  // Auto-scroll active caption into view during playback
  useEffect(() => {
    if (isActive && isPlaying && itemRef.current && !isEditing) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive, isPlaying, isEditing])

  const handleClick = () => {
    if (!isEditing) requestSeek(caption.start)
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
      className={cn(
        'group relative flex gap-3 px-3 py-3 mx-2 my-1.5 rounded-xl transition-all duration-[var(--duration-fast)] border',
        !isEditing && 'cursor-pointer',
        isActive
          ? 'bg-[var(--color-primary-muted)] border-[var(--color-primary)]/50 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-white/[0.04]',
      )}
    >
      {/* Index + timestamps */}
      <div className="flex flex-col gap-0.5 w-[52px] shrink-0 mt-0.5 select-none">
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}
        >
          #{index + 1}
        </span>
        <span className="text-[10px] font-mono tabular-nums leading-tight" style={{ color: 'var(--color-text-disabled)' }}>
          {formatTime(caption.start)}
        </span>
        <span className="text-[10px] font-mono tabular-nums leading-tight" style={{ color: 'var(--color-text-disabled)' }}>
          {formatTime(caption.end)}
        </span>
      </div>

      {/* Caption text / edit */}
      <div
        className="flex-1 min-w-0 pr-7 flex flex-col justify-center"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <CaptionInlineEdit
            initialText={caption.text}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p
            className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap select-none"
            style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          >
            {caption.text}
          </p>
        )}
      </div>

      {/* Actions (shown on hover) */}
      {!isEditing && (
        <div className="absolute top-2.5 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Edit caption"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteRequest(caption.id) }}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-danger)' }}
            aria-label="Delete caption"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
})
