import { Volume2, VolumeX, Volume1 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'

function VolumeIcon({ volume, isMuted }) {
  if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />
  if (volume < 0.5) return <Volume1 className="w-4 h-4" />
  return <Volume2 className="w-4 h-4" />
}

/**
 * Volume icon + slider that toggle-mutes on icon click.
 * @param {{ onVolumeChange: (v:number)=>void, onToggleMute: ()=>void }} props
 */
export function VolumeControl({ onVolumeChange, onToggleMute }) {
  const { volume, isMuted } = usePlayerStore()

  return (
    <div className="flex items-center gap-1.5 group/vol">
      <button
        onClick={onToggleMute}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon volume={volume} isMuted={isMuted} />
      </button>

      <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-20 h-1 accent-[var(--color-primary)] cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
