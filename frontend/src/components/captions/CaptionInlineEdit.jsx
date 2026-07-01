import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'

const MAX_CHARS = 500

/**
 * @param {{
 *   initialText: string,
 *   onSave: (text: string) => void,
 *   onCancel: () => void
 * }} props
 */
export function CaptionInlineEdit({ initialText, onSave, onCancel }) {
  const [text, setText] = useState(initialText)
  const ref = useRef(null)

  useEffect(() => {
    // Auto-focus and place cursor at end
    if (ref.current) {
      ref.current.focus()
      ref.current.selectionStart = text.length
      ref.current.selectionEnd   = text.length
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave(text) }
  }

  const charsOver = text.length > MAX_CHARS

  return (
    <div className="flex flex-col gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={Math.max(2, text.split('\n').length)}
        className="w-full resize-none rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors leading-relaxed"
        style={{
          background:  'var(--color-bg-base)',
          borderColor: charsOver ? 'var(--color-danger)' : 'var(--color-primary)',
          color:       'var(--color-text-primary)',
          boxShadow:   '0 0 0 3px var(--color-primary-muted)',
        }}
        aria-label="Edit caption text"
      />

      <div className="flex items-center justify-between">
        <span
          className="text-[10px] tabular-nums"
          style={{ color: charsOver ? 'var(--color-danger)' : 'var(--color-text-disabled)' }}
        >
          {text.length}/{MAX_CHARS}
        </span>
        <div className="flex gap-1">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-2 h-6 rounded text-xs transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Cancel edit"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            onClick={() => onSave(text)}
            disabled={charsOver || !text.trim()}
            className="flex items-center gap-1 px-2 h-6 rounded text-xs font-medium transition-colors disabled:opacity-40"
            style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary-light)' }}
            aria-label="Save caption"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
