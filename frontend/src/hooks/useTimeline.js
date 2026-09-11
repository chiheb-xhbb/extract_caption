import { useCallback } from 'react'
import { useTimelineStore } from '@/store/timelineStore'
import { usePlayerStore } from '@/store/playerStore'
import { useEditCaption } from '@/hooks/useEditCaption'
import { TIMELINE_BASE_PX_PER_SEC } from '@/config/constants'

const SNAP_UNIT   = 0.1   // snap to nearest 0.1 s
const MIN_DURATION = 0.1  // minimum caption duration

/**
 * Timeline coordinate math + block interaction handlers.
 * All time values are in seconds; pixels are derived on the fly.
 *
 * @param {number|string} projectId
 */
export function useTimeline(projectId) {
  const zoom        = useTimelineStore((s) => s.zoom)
  const snapEnabled = useTimelineStore((s) => s.snapEnabled)
  const duration    = usePlayerStore((s) => s.duration)

  const { editCaption } = useEditCaption(projectId)

  const pxPerSec = TIMELINE_BASE_PX_PER_SEC * zoom

  /** Convert a timestamp (seconds) to an absolute pixel x-position. */
  const timeToPx = useCallback((time) => time * pxPerSec, [pxPerSec])

  /** Convert a pixel delta to a time delta (in seconds). */
  const pxToTime = useCallback((px) => px / pxPerSec, [pxPerSec])

  const snap = (t) => Math.round(t / SNAP_UNIT) * SNAP_UNIT

  const clampTime = (t) => Math.max(0, duration > 0 ? Math.min(t, duration) : t)

  /**
   * Called when a block drag (move) finishes.
   * @param {number} captionId
   * @param {number} newStart  — unclamped/unsnapped new start time
   * @param {number} originalDuration — in seconds
   */
  const handleBlockDragEnd = useCallback((captionId, newStart, originalDuration) => {
    let s = clampTime(Math.max(0, newStart))
    if (snapEnabled) s = snap(s)

    // clamp end to duration as well
    let e = s + originalDuration
    if (duration > 0 && e > duration) {
      e = duration
      s = Math.max(0, e - originalDuration)
      if (snapEnabled) s = snap(s)
    }

    editCaption({ captionId, payload: { start: s, end: e } })
  }, [snapEnabled, duration, editCaption])

  /**
   * Called when a block resize (edge drag) finishes.
   * @param {number} captionId
   * @param {number} newStart
   * @param {number} newEnd
   */
  const handleBlockResizeEnd = useCallback((captionId, newStart, newEnd) => {
    let s = Math.max(0, newStart)
    let e = Math.max(s + MIN_DURATION, newEnd)

    if (snapEnabled) {
      s = snap(s)
      e = Math.max(s + MIN_DURATION, snap(e))
    }

    // Clamp to video duration
    if (duration > 0) {
      e = Math.min(e, duration)
      s = Math.min(s, e - MIN_DURATION)
    }

    editCaption({ captionId, payload: { start: s, end: e } })
  }, [snapEnabled, duration, editCaption])

  return { timeToPx, pxToTime, handleBlockDragEnd, handleBlockResizeEnd }
}
