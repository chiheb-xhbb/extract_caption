import { usePlayerStore } from '@/store/playerStore'
import './Timeline.css'

export function Playhead({ timeToPx }) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const x = timeToPx(currentTime)

  return (
    <div
      className="playhead"
      style={{ left: x }}
      aria-hidden="true"
    >
      <div className="playhead-cap" />
      <div className="playhead-line" />
    </div>
  )
}
