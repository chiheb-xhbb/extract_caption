import { useRef, useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import './Timeline.css'

/**
 * Draggable playhead. Positioned absolutely inside .tl-track-inner.
 * The cap handle is interactive; the line is purely visual.
 *
 * @param {{ timeToPx: (t:number)=>number, pxToTime: (px:number)=>number, duration: number }} props
 */
export function Playhead({ timeToPx, pxToTime, duration }) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const requestSeek = usePlayerStore((s) => s.requestSeek)

  const containerRef = useRef(null)

  const x = timeToPx(currentTime)

  const handleCapMouseDown = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()

    // Walk up to the scrollable container once at drag-start
    const scrollContainer = e.currentTarget.closest('.tl-track-container')

    const onMove = (ev) => {
      if (!scrollContainer) return
      const rect = scrollContainer.getBoundingClientRect()
      const rawPx = ev.clientX - rect.left + scrollContainer.scrollLeft
      const t = Math.max(0, Math.min(duration ?? Infinity, pxToTime(rawPx)))
      requestSeek(t)
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pxToTime, duration, requestSeek])

  return (
    <div
      ref={containerRef}
      className="tl-playhead"
      style={{ left: x }}
      aria-hidden="true"
    >
      <div
        className="tl-playhead-cap"
        onMouseDown={handleCapMouseDown}
        title="Drag to seek"
      />
      <div className="tl-playhead-line" />
    </div>
  )
}
