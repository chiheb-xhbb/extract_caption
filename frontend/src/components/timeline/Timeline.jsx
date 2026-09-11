import { useRef, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Magnet, Maximize2, Minus } from 'lucide-react'
import { useTimelineStore } from '@/store/timelineStore'
import { useCaptions } from '@/hooks/useCaptions'
import { useTimeline } from '@/hooks/useTimeline'
import { TimelineRuler } from '@/components/timeline/TimelineRuler'
import { TimelineCaptionBlock } from '@/components/timeline/TimelineCaptionBlock'
import { Playhead } from '@/components/timeline/Playhead'
import { usePlayerStore } from '@/store/playerStore'
import { cn } from '@/lib/cn'
import { TIMELINE_BASE_PX_PER_SEC, TIMELINE_DEFAULT_ZOOM } from '@/config/constants'
import './Timeline.css'

const TRACK_LABEL_WIDTH = 72   // px — left sidebar width for track labels
const RULER_HEIGHT      = 34   // px
const CAPTION_TRACK_H   = 56   // px
const END_PADDING       = 80   // px of empty space after duration

export function Timeline({ projectId }) {
  const containerRef   = useRef(null)
  const trackAreaRef   = useRef(null)

  const zoom          = useTimelineStore((s) => s.zoom)
  const snapEnabled   = useTimelineStore((s) => s.snapEnabled)
  const toggleSnap    = useTimelineStore((s) => s.toggleSnap)
  const zoomIn        = useTimelineStore((s) => s.zoomIn)
  const zoomOut       = useTimelineStore((s) => s.zoomOut)
  const resetZoom     = useTimelineStore((s) => s.resetZoom)
  const setScrollLeft = useTimelineStore((s) => s.setScrollLeft)

  const { captions }  = useCaptions(projectId)
  const duration      = usePlayerStore((s) => s.duration)
  const currentTime   = usePlayerStore((s) => s.currentTime)
  const requestSeek   = usePlayerStore((s) => s.requestSeek)

  const { timeToPx, pxToTime, handleBlockDragEnd, handleBlockResizeEnd } = useTimeline(projectId)

  const pxPerSec      = TIMELINE_BASE_PX_PER_SEC * zoom
  const totalWidth    = Math.max(timeToPx(duration || 0) + END_PADDING, (containerRef.current?.clientWidth ?? 800) - TRACK_LABEL_WIDTH)

  // ── Zoom percent label ─────────────────────────────────────
  const zoomPct = Math.round(zoom * 100)

  // ── Horizontal scroll sync ─────────────────────────────────
  const handleScroll = useCallback((e) => {
    setScrollLeft(e.target.scrollLeft)
  }, [setScrollLeft])

  // ── Ctrl+Wheel → zoom ──────────────────────────────────────
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

  // ── Auto-scroll playhead into view during playback ─────────
  useEffect(() => {
    const el = trackAreaRef.current
    if (!el || !duration) return
    const x = timeToPx(currentTime)
    const { scrollLeft, clientWidth } = el
    const margin = 100
    if (x < scrollLeft + margin) {
      el.scrollLeft = Math.max(0, x - margin)
    } else if (x > scrollLeft + clientWidth - margin) {
      el.scrollLeft = x - clientWidth + margin + 40
    }
  }, [currentTime, timeToPx, duration])

  // ── Click on track area → seek ─────────────────────────────
  const handleTrackClick = useCallback((e) => {
    if (e.target.closest('.tl-block')) return // let block handle it
    const el = trackAreaRef.current
    if (!el) return
    const rect    = el.getBoundingClientRect()
    const rawPx   = e.clientX - rect.left + el.scrollLeft
    const t       = Math.max(0, Math.min(duration ?? Infinity, pxToTime(rawPx)))
    requestSeek(t)
  }, [pxToTime, duration, requestSeek])

  // ── Fit timeline to view ───────────────────────────────────
  const handleFit = useCallback(() => {
    const viewW = (containerRef.current?.clientWidth ?? 800) - TRACK_LABEL_WIDTH
    if (!duration || duration <= 0 || viewW <= 0) { resetZoom(); return }
    const fitZoom = viewW / (duration * TIMELINE_BASE_PX_PER_SEC)
    useTimelineStore.getState().setZoom(fitZoom)
    if (trackAreaRef.current) trackAreaRef.current.scrollLeft = 0
  }, [duration, resetZoom])

  return (
    <div className="tl-root" ref={containerRef}>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="tl-toolbar">
        <div className="tl-toolbar-group">
          <button
            className={cn('tl-btn', snapEnabled && 'active')}
            onClick={toggleSnap}
            title="Snap to grid (0.1s)"
            aria-pressed={snapEnabled}
          >
            <Magnet width={12} height={12} />
            <span className="tl-btn-label">Snap</span>
          </button>
        </div>

        <div className="tl-toolbar-sep" />

        <div className="tl-toolbar-group">
          <button className="tl-btn" onClick={zoomOut} title="Zoom out (Ctrl −)">
            <Minus width={12} height={12} />
          </button>

          <button
            className="tl-btn tl-zoom-pct"
            onClick={resetZoom}
            title="Reset zoom (100%)"
          >
            {zoomPct}%
          </button>

          <button className="tl-btn" onClick={zoomIn} title="Zoom in (Ctrl +)">
            <ZoomIn width={12} height={12} />
          </button>
        </div>

        <div className="tl-toolbar-sep" />

        <button className="tl-btn" onClick={handleFit} title="Fit timeline to view">
          <Maximize2 width={12} height={12} />
          <span className="tl-btn-label">Fit</span>
        </button>
      </div>

      {/* ── Timeline body: labels column + scrollable track area ── */}
      <div className="tl-body">

        {/* Fixed left label column */}
        <div className="tl-labels" style={{ width: TRACK_LABEL_WIDTH }}>
          {/* Ruler row — spacer */}
          <div className="tl-label-ruler-spacer" style={{ height: RULER_HEIGHT }} />
          {/* Caption track label */}
          <div className="tl-label-track" style={{ height: CAPTION_TRACK_H }}>
            Captions
          </div>
          {/* Future tracks placeholder */}
          <div className="tl-label-future" />
        </div>

        {/* Scrollable track area */}
        <div
          ref={trackAreaRef}
          className="tl-track-container"
          onScroll={handleScroll}
          onClick={handleTrackClick}
          role="region"
          aria-label="Timeline"
        >
          <div
            className="tl-track-inner"
            style={{ width: totalWidth }}
          >
            {/* ── Ruler ─────────────────────────────────────── */}
            <div className="tl-ruler-row" style={{ height: RULER_HEIGHT }}>
              <TimelineRuler duration={duration} timeToPx={timeToPx} pxPerSec={pxPerSec} />
            </div>

            {/* ── Caption track ─────────────────────────────── */}
            <div
              className="tl-caption-track"
              style={{ height: CAPTION_TRACK_H }}
            >
              {captions.map((c) => (
                <TimelineCaptionBlock
                  key={c.id}
                  caption={c}
                  timeToPx={timeToPx}
                  pxToTime={pxToTime}
                  duration={duration}
                  onDragEnd={handleBlockDragEnd}
                  onResizeEnd={handleBlockResizeEnd}
                />
              ))}
            </div>

            {/* ── Future track area ──────────────────────────── */}
            <div className="tl-future-track" />

            {/* ── End of video marker ────────────────────────── */}
            {!!duration && (
              <div
                className="tl-end-marker"
                style={{ left: timeToPx(duration) }}
                title={`Video end`}
              />
            )}

            {/* ── Playhead (spans ruler + all tracks) ───────── */}
            <Playhead
              timeToPx={timeToPx}
              pxToTime={pxToTime}
              duration={duration}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
