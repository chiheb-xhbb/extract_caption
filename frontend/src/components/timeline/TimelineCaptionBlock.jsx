import { useRef, useState, memo, useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/lib/cn'
import './Timeline.css'

export const TimelineCaptionBlock = memo(function TimelineCaptionBlock({
  caption,
  timeToPx,
  pxToTime,
  duration,
  onDragEnd,
  onResizeEnd,
}) {
  const isSelected        = useEditorStore((s) => s.selectedCaptionId === caption.id)
  const setSelectedCaption = useEditorStore((s) => s.setSelectedCaption)
  const requestSeek       = usePlayerStore((s) => s.requestSeek)
  const currentTime       = usePlayerStore((s) => s.currentTime)

  const [drag, setDrag] = useState({ dl: 0, dr: 0, mode: 'none' })
  const isDragging = drag.mode !== 'none'

  const isActive = currentTime >= (caption.start ?? 0) && currentTime <= (caption.end ?? 0)

  let startPx = timeToPx(caption.start) + (drag.mode === 'move' || drag.mode === 'left' ? drag.dl : 0)
  let endPx   = timeToPx(caption.end)
    + (drag.mode === 'move'  ? drag.dl : 0)
    + (drag.mode === 'right' ? drag.dr : 0)

  const MIN_WIDTH = 6
  if (endPx - startPx < MIN_WIDTH) endPx = startPx + MIN_WIDTH
  const widthPx = endPx - startPx

  const handleClick = useCallback((e) => {
    if (isDragging) return
    e.stopPropagation()
    setSelectedCaption(caption.id)
    requestSeek(caption.start)
  }, [isDragging, caption.id, caption.start, setSelectedCaption, requestSeek])

  const startDrag = useCallback((e, mode) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX

    const onMove = (ev) => {
      const delta = ev.clientX - startX
      if (mode === 'move')  setDrag({ dl: delta, dr: 0,     mode })
      if (mode === 'left')  setDrag({ dl: delta, dr: 0,     mode })
      if (mode === 'right') setDrag({ dl: 0,     dr: delta, mode })
    }

    const onUp = (ev) => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      const delta = ev.clientX - startX

      if (mode === 'move')  onDragEnd(caption.id, Math.max(0, caption.start + pxToTime(delta)), caption.end - caption.start)
      if (mode === 'left')  onResizeEnd(caption.id, Math.max(0, caption.start + pxToTime(delta)), caption.end)
      if (mode === 'right') onResizeEnd(caption.id, caption.start, Math.min(duration ?? Infinity, caption.end + pxToTime(delta)))

      setDrag({ dl: 0, dr: 0, mode: 'none' })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }, [caption, pxToTime, duration, onDragEnd, onResizeEnd])

  const tooNarrow = widthPx < 40

  return (
    <div
      className={cn(
        'tl-block',
        isSelected && 'selected',
        isActive   && 'active',
        isDragging && 'dragging',
        tooNarrow  && 'narrow',
      )}
      style={{ left: startPx, width: widthPx }}
      onClick={handleClick}
      title={caption.text}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e) }}
      aria-label={`Caption: ${caption.text}`}
      aria-selected={isSelected}
    >
      <div className="tl-block-handle tl-block-handle-left"  onMouseDown={(e) => startDrag(e, 'left')}  aria-hidden="true" />
      <div className="tl-block-body" onMouseDown={(e) => startDrag(e, 'move')}>
        {!tooNarrow && <span className="tl-block-text">{caption.text}</span>}
      </div>
      <div className="tl-block-handle tl-block-handle-right" onMouseDown={(e) => startDrag(e, 'right')} aria-hidden="true" />
    </div>
  )
})
