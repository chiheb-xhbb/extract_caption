import { Volume2, VolumeX } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import './VideoPlayer.css'

export function VolumeControl({ onVolumeChange, onToggleMute }) {
  const { volume, isMuted } = usePlayerStore()
  const displayVol = isMuted ? 0 : volume

  return (
    <div className="volume-ctrl">
      <button
        onClick={onToggleMute}
        className="volume-mute-btn"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || volume === 0
          ? <VolumeX  width={15} height={15} />
          : <Volume2  width={15} height={15} />}
      </button>
      <input
        type="range"
        min={0} max={1} step={0.01}
        value={displayVol}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="volume-slider"
        aria-label="Volume"
      />
    </div>
  )
}
