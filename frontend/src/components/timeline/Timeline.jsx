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
import './Timeline.css'

export function Timeline({ projectId }) {
  const containerRef  = useRef(null)
  const snapEnabled   = useTimelineStore((s) => s.snapEnabled)
  const toggleSnap    = useTimelineStore((s) => s.toggleSnap)
  const zoomIn        = useTimelineStore((s) => s.zoomIn)
  const zoomOut       = useTimelineStore((s) => s.zoomOut)
  const setScrollLeft = useTimelineStore((s) => s.setScrollLeft)

  const { captions } = useCaptions(projectId)
  const duration      = usePlayerStore((s) => s.duration)
  const { timeToPx, pxToTime, handleBlockDragEnd, handleBlockResizeEnd } = useTimeline(projectId)

  const handleScroll = (e) => setScrollLeft(e.target.scrollLeft)

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
    <div className="timeline-root">

      {/* Toolbar */}
      <div className="timeline-toolbar">
        <button
          onClick={toggleSnap}
          className={cn('timeline-toolbar-btn', snapEnabled && 'active')}
          title="Toggle snap to grid (0.1s)"
        >
          <Magnet width={13} height={13} />
        </button>
        <div className="timeline-toolbar-divider" />
        <button onClick={zoomOut} className="timeline-toolbar-btn" title="Zoom out">
          <ZoomOut width={13} height={13} />
        </button>
        <button onClick={zoomIn} className="timeline-toolbar-btn" title="Zoom in">
          <ZoomIn width={13} height={13} />
        </button>
      </div>

      {/* Track Container */}
      <div
        ref={containerRef}
        className="timeline-track-container"
        onScroll={handleScroll}
      >
        <div
          className="timeline-track-inner"
          style={{ width: Math.max(timeToPx(duration || 0) + 200, window.innerWidth) }}
        >
          <TimelineRuler duration={duration} timeToPx={timeToPx} />
          <Playhead timeToPx={timeToPx} />

          <div className="timeline-captions-lane">
            {captions.map((c) => (
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
