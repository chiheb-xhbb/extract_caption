import { useRef, useCallback } from 'react'
import { cn } from '@/lib/cn'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Seek bar — progress track with clickable/draggable thumb.
 * @param {{ currentTime: number, duration: number, onSeek: (t:number)=>void }} props
 */
export function SeekBar({ currentTime, duration, onSeek }) {
  const trackRef = useRef(null)

  const getTimeFromEvent = useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    return ratio * (duration || 0)
  }, [duration])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    onSeek(getTimeFromEvent(e))

    const onMove = (ev) => onSeek(getTimeFromEvent(ev))
    const onUp   = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [getTimeFromEvent, onSeek])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-xs font-mono w-10 text-right shrink-0"
            style={{ color: 'var(--color-text-secondary)' }}>
        {formatTime(currentTime)}
      </span>

      <div
        ref={trackRef}
        className="relative flex-1 h-1 rounded-full cursor-pointer group/seek"
        style={{ background: 'var(--color-bg-muted)' }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
        />
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -ml-1.5',
            'opacity-0 group-hover/seek:opacity-100 scale-0 group-hover/seek:scale-100',
            'transition-all duration-150',
          )}
          style={{ left: `${progress}%`, background: 'var(--color-primary)' }}
        />
      </div>

      <span className="text-xs font-mono w-10 shrink-0"
            style={{ color: 'var(--color-text-muted)' }}>
        {formatTime(duration)}
      </span>
    </div>
  )
}
