import { useRef, useState, useCallback, memo } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useTimelineStore } from '@/store/timelineStore'
import { cn } from '@/lib/cn'

export const TimelineCaptionBlock = memo(function TimelineCaptionBlock({ 
  caption, 
  timeToPx, 
  pxToTime, 
  onDragEnd, 
  onResizeEnd 
}) {
  const isSelected = useTimelineStore((s) => s.selectedBlockId === caption.id)
  const setSelected = useTimelineStore((s) => s.setSelectedBlock)
  const requestSeek = usePlayerStore((s) => s.requestSeek)
  
  // Local drag state for smooth visual updates without server roundtrips
  const [dragOffset, setDragOffset] = useState({ left: 0, right: 0 })
  const isDragging = dragOffset.left !== 0 || dragOffset.right !== 0
  
  const startPx = timeToPx(caption.start) + dragOffset.left
  const durationPx = timeToPx(caption.end - caption.start) + dragOffset.right - dragOffset.left

  const handleClick = (e) => {
    // Avoid selecting if dragged
    if (isDragging) return
    setSelected(caption.id)
    requestSeek(caption.start)
  }

  // --- Move Entire Block ---
  const handleBodyMouseDown = (e) => {
    e.stopPropagation()
    const startX = e.clientX
    
    const onMove = (ev) => setDragOffset({ left: ev.clientX - startX, right: ev.clientX - startX })
    
    const onUp = (ev) => {
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

  // --- Resize Left/Right Edges ---
  const handleResize = (e, edge) => {
    e.stopPropagation()
    const startX = e.clientX
    
    const onMove = (ev) => {
      const delta = ev.clientX - startX
      if (edge === 'left') {
        const maxDelta = timeToPx(caption.end - caption.start) - 10
        setDragOffset(prev => ({ ...prev, left: Math.min(delta, maxDelta) }))
      } else {
        const minDelta = -timeToPx(caption.end - caption.start) + 10
        setDragOffset(prev => ({ ...prev, right: Math.max(delta, minDelta) }))
      }
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      
      setDragOffset(curr => {
        if (curr.left !== 0 || curr.right !== 0) {
          const newStart = caption.start + pxToTime(curr.left)
          const newEnd = caption.end + pxToTime(curr.right)
          onResizeEnd(caption.id, newStart, newEnd)
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
        "absolute top-8 h-12 rounded-md border flex items-center overflow-hidden transition-colors shadow-sm",
        isSelected 
          ? "border-white bg-[var(--color-primary)] z-10" 
          : "border-[var(--color-primary-muted)] bg-[var(--color-primary-muted)] hover:border-[var(--color-primary)] opacity-90",
        isDragging && "cursor-grabbing opacity-100 z-10 shadow-md transition-none"
      )}
      style={{ left: startPx, width: durationPx }}
      onClick={handleClick}
    >
      {/* Left resize handle */}
      <div 
        className={cn("absolute left-0 w-2 h-full cursor-ew-resize opacity-0 hover:opacity-100 bg-white/20", isSelected && "opacity-50")}
        onMouseDown={(e) => handleResize(e, 'left')} 
      />
      
      {/* Body content */}
      <div 
        className="flex-1 px-2 text-xs font-medium cursor-grab truncate pointer-events-auto h-full flex items-center select-none"
        onMouseDown={handleBodyMouseDown}
        style={{ color: isSelected ? 'white' : 'var(--color-text-primary)' }}
      >
        {caption.text}
      </div>

      {/* Right resize handle */}
      <div 
        className={cn("absolute right-0 w-2 h-full cursor-ew-resize opacity-0 hover:opacity-100 bg-white/20", isSelected && "opacity-50")} 
        onMouseDown={(e) => handleResize(e, 'right')} 
      />
    </div>
  )
})
