import { useCallback } from 'react'
import { useTimelineStore } from '@/store/timelineStore'
import { useEditCaption } from '@/hooks/useEditCaption'
import { TIMELINE_BASE_PX_PER_SEC } from '@/config/constants'

/**
 * Provides timeline math and block dragging logic.
 * @param {number|string} projectId 
 */
export function useTimeline(projectId) {
  const zoom = useTimelineStore((s) => s.zoom)
  const snapEnabled = useTimelineStore((s) => s.snapEnabled)
  
  const { editCaption } = useEditCaption(projectId)

  // Math (1 second = TIMELINE_BASE_PX_PER_SEC * zoom pixels)
  const timeToPx = useCallback((time) => time * TIMELINE_BASE_PX_PER_SEC * zoom, [zoom])
  const pxToTime = useCallback((px) => px / (TIMELINE_BASE_PX_PER_SEC * zoom), [zoom])

  const snapToTenth = (time) => Math.round(time * 10) / 10

  /**
   * Called when a block drag finishes
   * @param {number} captionId 
   * @param {number} newStartTime 
   * @param {number} originalDuration 
   */
  const handleBlockDragEnd = useCallback((captionId, newStartTime, originalDuration) => {
    let finalStart = Math.max(0, newStartTime)
    if (snapEnabled) finalStart = snapToTenth(finalStart)

    editCaption({
      captionId,
      payload: {
        start: finalStart,
        end: finalStart + originalDuration
      }
    })
  }, [snapEnabled, editCaption])

  /**
   * Called when a block resize finishes
   */
  const handleBlockResizeEnd = useCallback((captionId, newStart, newEnd) => {
    let finalStart = Math.max(0, newStart)
    let finalEnd = Math.max(finalStart + 0.1, newEnd) // Enforce min duration

    if (snapEnabled) {
      finalStart = snapToTenth(finalStart)
      finalEnd = Math.max(finalStart + 0.1, snapToTenth(finalEnd))
    }

    editCaption({
      captionId,
      payload: {
        start: finalStart,
        end: finalEnd
      }
    })
  }, [snapEnabled, editCaption])

  return {
    timeToPx,
    pxToTime,
    handleBlockDragEnd,
    handleBlockResizeEnd
  }
}
