import { useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, Magnet } from 'lucide-react'
import { useTimelineStore } from '@/store/timelineStore'
import { useCaptions } from '@/hooks/useCaptions'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineRuler } from '@/components/timeline/TimelineRuler'
import { TimelineCaptionBlock } from '@/components/timeline/TimelineCaptionBlock'
import { Playhead } from '@/components/timeline/Playhead'
import { usePlayerStore } from '@/store/playerStore'
import { cn } from '@/lib/cn'

export function Timeline({ projectId }) {
  const containerRef = useRef(null)
  const snapEnabled = useTimelineStore((s) => s.snapEnabled)
  const toggleSnap = useTimelineStore((s) => s.toggleSnap)
  const zoomIn = useTimelineStore((s) => s.zoomIn)
  const zoomOut = useTimelineStore((s) => s.zoomOut)
  const setScrollLeft = useTimelineStore((s) => s.setScrollLeft)

  const { captions } = useCaptions(projectId)
  const duration = usePlayerStore((s) => s.duration)
  const { timeToPx, pxToTime, handleBlockDragEnd, handleBlockResizeEnd } = useTimeline(projectId)

  // Track scroll position in store
  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft)
  }

  // Wheel to zoom (cmd/ctrl + wheel)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) zoomIn()
        else zoomOut()
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomIn, zoomOut])

  return (
    <div className="flex flex-col h-full w-full relative">

      {/* Toolbar */}
      <div
        className="absolute top-3 right-4 flex items-center gap-1 rounded-lg p-1 border animate-fade-in"
        style={{
          background: 'var(--color-bg-glass)',
          borderColor: 'var(--color-border)',
          zIndex: 'var(--z-above)',
        }}
      >
        <button
          onClick={toggleSnap}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
            snapEnabled
              ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary-light)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-secondary)]',
          )}
          title="Toggle Snap to Grid (0.1s)"
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 mx-0.5" style={{ background: 'var(--color-border-strong)' }} />

        <button
          onClick={zoomOut}
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-secondary)]"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={zoomIn}
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-secondary)]"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Track Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar-timeline"
        onScroll={handleScroll}
      >
        <div
          className="relative h-full"
          style={{ width: Math.max(timeToPx(duration || 0) + 200, window.innerWidth) }}
        >
          <TimelineRuler duration={duration} timeToPx={timeToPx} />
          <Playhead timeToPx={timeToPx} />

          <div className="relative w-full h-full pt-6">
            {captions.map(c => (
              <TimelineCaptionBlock
                key={c.id}
                caption={c}
                timeToPx={timeToPx}
                pxToTime={pxToTime}
                onDragEnd={handleBlockDragEnd}
                onResizeEnd={handleBlockResizeEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
