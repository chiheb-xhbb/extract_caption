import { usePlayerStore } from '@/store/playerStore'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { VideoControls } from '@/components/video/VideoControls'
import { SubtitleOverlay } from '@/components/video/SubtitleOverlay'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { resolveVideoUrl } from '@/utils/url'
import './VideoPlayer.css'

export function VideoPlayer({ src, activeCaption, className }) {
  const { videoRef, play, pause, seek, setVolume, toggleFullscreen } = useVideoPlayer()
  const store = usePlayerStore()
  const { toggleMute, isBuffering, isReady, playbackError } = store

  const videoSrc = resolveVideoUrl(src)

  if (!videoSrc) {
    return (
      <div className={cn('video-player-root', className)} style={{ alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>No video file attached to this project.</p>
      </div>
    )
  }

  return (
    <div
      data-fullscreen-root=""
      className={cn('video-player-root', className)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="flex-1 w-full object-contain min-h-0"
        preload="metadata"
        playsInline
        muted={false}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            usePlayerStore.getState().setDuration(videoRef.current.duration)
          }
        }}
        onCanPlay={() => {
          if (videoRef.current) {
            usePlayerStore.getState().setDuration(videoRef.current.duration)
          }
        }}
        onError={() => {
          usePlayerStore.getState().setIsPlaying(false)
        }}
        onClick={() => {
          if (videoRef.current?.paused) play()
          else pause()
        }}
      />

      {/* Buffering */}
      {(!isReady || isBuffering) && !playbackError && (
        <div className="video-player-overlay video-buffering-overlay">
          <Loader2 width={32} height={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      )}

      {/* Error */}
      {playbackError && (
        <div className="video-player-overlay video-error-overlay">
          <div className="video-error-icon-wrap">
            <AlertCircle width={22} height={22} />
          </div>
          <p className="video-error-title">Playback Error</p>
          <p className="video-error-msg">{playbackError}</p>
        </div>
      )}

      {/* Subtitle */}
      <SubtitleOverlay caption={activeCaption} />

      {/* Controls */}
      <div className="video-controls-wrap">
        <VideoControls
          onPlay={play}
          onPause={pause}
          onSeek={seek}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  )
}
