import { useRef, useState, memo } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useTimelineStore } from '@/store/timelineStore'
import { cn } from '@/lib/cn'
import './Timeline.css'

export const TimelineCaptionBlock = memo(function TimelineCaptionBlock({
  caption,
  timeToPx,
  pxToTime,
  onDragEnd,
  onResizeEnd,
}) {
  const isSelected  = useTimelineStore((s) => s.selectedBlockId === caption.id)
  const setSelected = useTimelineStore((s) => s.setSelectedBlock)
  const requestSeek = usePlayerStore((s) => s.requestSeek)

  const [dragOffset, setDragOffset] = useState({ left: 0, right: 0 })
  const isDragging = dragOffset.left !== 0 || dragOffset.right !== 0

  const startPx    = timeToPx(caption.start) + dragOffset.left
  const durationPx = timeToPx(caption.end - caption.start) + dragOffset.right - dragOffset.left

  const handleClick = () => {
    if (isDragging) return
    setSelected(caption.id)
    requestSeek(caption.start)
  }

  const handleBodyMouseDown = (e) => {
    e.stopPropagation()
    const startX = e.clientX
    const onMove = (ev) => setDragOffset({ left: ev.clientX - startX, right: ev.clientX - startX })
    const onUp   = (ev) => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      const deltaPx = ev.clientX - startX
      if (deltaPx !== 0) {
        onDragEnd(caption.id, caption.start + pxToTime(deltaPx), caption.end - caption.start)
      }
      setDragOffset({ left: 0, right: 0 })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleResize = (e, edge) => {
    e.stopPropagation()
    const startX = e.clientX
    const onMove = (ev) => {
      const delta = ev.clientX - startX
      if (edge === 'left') {
        const maxDelta = timeToPx(caption.end - caption.start) - 10
        setDragOffset((prev) => ({ ...prev, left: Math.min(delta, maxDelta) }))
      } else {
        const minDelta = -timeToPx(caption.end - caption.start) + 10
        setDragOffset((prev) => ({ ...prev, right: Math.max(delta, minDelta) }))
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setDragOffset((curr) => {
        if (curr.left !== 0 || curr.right !== 0) {
          onResizeEnd(caption.id, caption.start + pxToTime(curr.left), caption.end + pxToTime(curr.right))
        }
        return { left: 0, right: 0 }
      })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={cn(
        'timeline-block',
        isSelected  && 'selected',
        isDragging  && 'dragging',
      )}
      style={{ left: startPx, width: durationPx }}
      onClick={handleClick}
    >
      <div className="timeline-block-resize-left"  onMouseDown={(e) => handleResize(e, 'left')} />
      <div className="timeline-block-body" onMouseDown={handleBodyMouseDown}>
        {caption.text}
      </div>
      <div className="timeline-block-resize-right" onMouseDown={(e) => handleResize(e, 'right')} />
    </div>
  )
})
