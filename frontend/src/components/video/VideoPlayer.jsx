import { usePlayerStore } from '@/store/playerStore'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { VideoControls } from '@/components/video/VideoControls'
import { SubtitleOverlay } from '@/components/video/SubtitleOverlay'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { resolveVideoUrl } from '@/utils/url'

/**
 * Native HTML5 video player with custom controls and subtitle overlay.
 *
 * @param {{
 *   src: string,
 *   activeCaption: import('@/types/caption').Caption|null,
 *   className?: string
 * }} props
 */
export function VideoPlayer({ src, activeCaption, className }) {
  const { videoRef, play, pause, seek, setVolume, toggleFullscreen } = useVideoPlayer()
  const store = usePlayerStore()
  const { toggleMute, isBuffering, isReady, playbackError } = store

  const videoSrc = resolveVideoUrl(src)

  console.log('Video URL:', videoSrc)

  if (!videoSrc) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0b]">
        <p className="text-sm text-[#52525b]">No video file attached to this project.</p>
      </div>
    )
  }

  return (
    <div
      data-fullscreen-root=""
      className={cn(
        'relative flex flex-col overflow-hidden bg-black group/player',
        className,
      )}
    >
      {/* Video element */}
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

      {/* Buffering Overlay */}
      {(!isReady || isBuffering) && !playbackError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      {/* Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6 text-center" style={{ background: 'var(--color-bg-overlay)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertCircle className="w-6 h-6" style={{ color: 'var(--color-danger)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Playback Error</p>
          <p className="text-xs max-w-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{playbackError}</p>
        </div>
      )}

      {/* Subtitle overlay */}
      <SubtitleOverlay caption={activeCaption} />

      {/* Custom controls — fade in on hover */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0',
          'opacity-0 group-hover/player:opacity-100',
          'transition-opacity duration-200',
        )}
      >
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
