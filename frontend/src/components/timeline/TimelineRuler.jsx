import { memo } from 'react'
import { useTimelineStore } from '@/store/timelineStore'
import { TIMELINE_BASE_PX_PER_SEC } from '@/config/constants'

export const TimelineRuler = memo(function TimelineRuler({ duration, timeToPx }) {
  const zoom = useTimelineStore((s) => s.zoom)
  
  // Calculate dynamic tick interval based on zoom to prevent text overlap
  // We want roughly 50px minimum between labels
  const pxPerSec = TIMELINE_BASE_PX_PER_SEC * zoom
  let tickInterval = 1
  if (pxPerSec < 50) tickInterval = 5
  if (pxPerSec < 20) tickInterval = 10
  if (pxPerSec < 10) tickInterval = 30
  if (pxPerSec < 5) tickInterval = 60

  const totalSeconds = Math.ceil(duration || 0) + 10 
  
  // Only create ticks for the current interval
  const ticks = []
  for (let i = 0; i <= totalSeconds; i += tickInterval) {
    ticks.push(i)
  }

  return (
    <div className="absolute top-0 left-0 h-6 border-b pointer-events-none" style={{ borderColor: 'var(--color-border)', width: timeToPx(totalSeconds) }}>
      {/* We can still draw minor ticks every second if space allows, but let's stick to simple ticks for now */}
      {ticks.map((sec) => (
        <div 
          key={sec} 
          className="absolute top-0 flex flex-col items-center"
          style={{ left: timeToPx(sec) }}
        >
          <div className="w-px h-2 bg-gray-500" />
          <span className="text-[10px] text-gray-500 mt-1 font-mono -translate-x-1/2">
            {sec}s
          </span>
        </div>
      ))}
    </div>
  )
})
