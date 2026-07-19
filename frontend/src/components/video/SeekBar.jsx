import { usePlayerStore } from '@/store/playerStore'
import './VideoPlayer.css'

export function SeekBar({ currentTime, duration, onSeek }) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleChange = (e) => {
    const t = (Number(e.target.value) / 100) * duration
    onSeek(t)
  }

  return (
    <div className="seekbar">
      <div className="seekbar-track">
        <div className="seekbar-fill" style={{ width: `${pct}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.01}
        value={pct}
        onChange={handleChange}
        className="seekbar-input"
        aria-label="Seek"
      />
    </div>
  )
}
