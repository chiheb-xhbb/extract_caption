import { memo } from 'react'
import { usePlayerStore } from '@/store/playerStore'

export const Playhead = memo(function Playhead({ timeToPx }) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  
  return (
    <div 
      className="absolute top-0 bottom-0 z-20 pointer-events-none"
      style={{ left: timeToPx(currentTime) }}
    >
      <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] flex flex-col items-center">
        {/* Playhead thumb handle (top) */}
        <div className="absolute top-0 -mt-1 w-3 h-3 bg-white rounded-sm pointer-events-auto cursor-ew-resize" />
      </div>
    </div>
  )
})
