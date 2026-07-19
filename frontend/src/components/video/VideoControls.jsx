import { useState } from 'react'
import { Play, Pause, Maximize2, Minimize2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { SeekBar } from '@/components/video/SeekBar'
import { VolumeControl } from '@/components/video/VolumeControl'
import { PLAYBACK_SPEEDS } from '@/config/constants'
import { cn } from '@/lib/cn'
import './VideoPlayer.css'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoControls({
  onPlay, onPause, onSeek,
  onVolumeChange, onToggleMute, onToggleFullscreen,
}) {
  const { currentTime, duration, isPlaying, isFullscreen, speed, setSpeed } = usePlayerStore()
  const [speedOpen, setSpeedOpen] = useState(false)

  return (
    <div className="video-controls">
      <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      <div className="video-controls-row">
        {/* Left */}
        <div className="video-ctrl-left">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="video-ctrl-btn"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause width={16} height={16} style={{ fill: 'currentColor' }} />
              : <Play  width={16} height={16} style={{ fill: 'currentColor' }} />}
          </button>

          <VolumeControl onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} />

          <div className="video-ctrl-time">
            <span>{formatTime(currentTime)}</span>
            <span className="sep">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right */}
        <div className="video-ctrl-right">
          <div className="video-speed-wrap">
            <button
              onClick={() => setSpeedOpen((v) => !v)}
              className="video-speed-btn"
              aria-label="Playback speed"
              aria-expanded={speedOpen}
            >
              {speed}×
            </button>

            {speedOpen && (
              <div className="video-speed-dropdown">
                {PLAYBACK_SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setSpeedOpen(false) }}
                    className={cn('video-speed-option', s === speed && 'active')}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleFullscreen}
            className="video-ctrl-btn"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen
              ? <Minimize2 width={14} height={14} />
              : <Maximize2 width={14} height={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
