import { useState } from 'react'
import { Play, Pause, Maximize2, Minimize2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { SeekBar } from '@/components/video/SeekBar'
import { VolumeControl } from '@/components/video/VolumeControl'
import { PLAYBACK_SPEEDS } from '@/config/constants'
import { cn } from '@/lib/cn'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * @param {{
 *   onPlay: () => void,
 *   onPause: () => void,
 *   onSeek: (t: number) => void,
 *   onVolumeChange: (v: number) => void,
 *   onToggleMute: () => void,
 *   onToggleFullscreen: () => void
 * }} props
 */
export function VideoControls({
  onPlay, onPause, onSeek,
  onVolumeChange, onToggleMute, onToggleFullscreen,
}) {
  const { currentTime, duration, isPlaying, isFullscreen, speed, setSpeed } = usePlayerStore()
  const [speedOpen, setSpeedOpen] = useState(false)

  return (
    <div
      className="flex flex-col gap-2 px-4 pt-6 pb-3"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
      }}
    >
      {/* Seek bar row */}
      <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">

        {/* Left — play + volume + time */}
        <div className="flex items-center gap-1">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/15 active:scale-95"
            style={{ color: '#fff' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause className="w-4 h-4 fill-current" />
              : <Play  className="w-4 h-4 fill-current" />}
          </button>

          <VolumeControl onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} />

          <div className="hidden sm:flex items-center ml-2 tabular-nums text-xs font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 opacity-40">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right — speed + fullscreen */}
        <div className="flex items-center gap-1">
          {/* Speed picker — React state, not CSS-only */}
          <div className="relative">
            <button
              onClick={() => setSpeedOpen((v) => !v)}
              className="px-2 h-7 rounded text-xs font-mono font-medium transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              aria-label="Playback speed"
              aria-expanded={speedOpen}
            >
              {speed}×
            </button>

            {speedOpen && (
              <div
                className="absolute bottom-9 right-0 flex flex-col rounded-xl border py-1 min-w-[80px] animate-scale-in"
                style={{
                  background:  'var(--color-bg-overlay)',
                  borderColor: 'var(--color-border)',
                  boxShadow:   'var(--shadow-lg)',
                  zIndex:      'var(--z-dropdown)',
                }}
              >
                {PLAYBACK_SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setSpeedOpen(false) }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-mono text-left transition-colors hover:bg-white/5',
                      s === speed && 'font-bold',
                    )}
                    style={{ color: s === speed ? 'var(--color-primary-light)' : 'var(--color-text-secondary)' }}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleFullscreen}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/10 active:scale-95"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen
              ? <Minimize2 className="w-4 h-4" />
              : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
