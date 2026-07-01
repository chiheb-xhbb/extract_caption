import { useEffect, useMemo, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'

/**
 * Syncs the current playing time with the active caption.
 * Returns the currently active caption and ref for scrolling.
 * 
 * @param {import('@/types/caption').Caption[]} captions 
 */
export function useCaptionSync(captions) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  
  // Find which caption is active right now based on currentTime
  const activeCaption = useMemo(() => {
    if (!Array.isArray(captions) || captions.length === 0) return null
    // Captions are sorted by the backend relation order and use Laravel's start/end fields.
    return captions.find(c => c && currentTime >= (c.start ?? 0) && currentTime <= (c.end ?? 0)) ?? null
  }, [captions, currentTime])

  const listRef = useRef(null)
  
  // Auto-scroll logic could be added here if we want the generic list to scroll.
  // Alternatively, the list component can handle scrolling by observing activeCaption.id

  return {
    activeCaption,
    listRef
  }
}
