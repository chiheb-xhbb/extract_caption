import { useRef, useEffect, useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'

/**
 * Binds a <video> element to playerStore and exposes imperative controls.
 * Keyboard shortcuts are attached here and only fire when no text input is focused.
 */
export function useVideoPlayer() {
  const videoRef = useRef(null)
  const store    = usePlayerStore()
  const requestedTime = usePlayerStore((s) => s.requestedTime)

  // ── Sync element events → store ───────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlers = {
      timeupdate:      () => store.setCurrentTime(video.currentTime),
      durationchange:  () => store.setDuration(video.duration),
      loadedmetadata:  () => store.setDuration(video.duration),
      canplay:         () => { store.setDuration(video.duration); store.setBuffering(false) },
      waiting:         () => store.setBuffering(true),
      playing:         () => { store.setIsPlaying(true); store.setBuffering(false) },
      play:            () => { store.setIsPlaying(true); store.setPlaybackError(null) },
      pause:           () => store.setIsPlaying(false),
      ended:           () => store.setIsPlaying(false),
      error:           () => store.setPlaybackError(video.error?.message || 'Video failed to load'),
      volumechange:    () => {
        if (!video.muted) store.setVolume(video.volume)
      },
    }

    Object.entries(handlers).forEach(([ev, fn]) => video.addEventListener(ev, fn))
    return () => Object.entries(handlers).forEach(([ev, fn]) => video.removeEventListener(ev, fn))
  }, [])

  // Sync seek requests from caption/timeline UI -> actual video element.
  useEffect(() => {
    const video = videoRef.current
    if (!video || requestedTime == null) return
    if (Number.isFinite(requestedTime) && Math.abs(video.currentTime - requestedTime) > 0.05) {
      video.currentTime = requestedTime
    }
  }, [requestedTime])

  // ── Sync store.speed → element ────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = store.speed
  }, [store.speed])

  // ── Sync store.volume/mute → element ─────────────────────
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume = store.isMuted ? 0 : store.volume
  }, [store.volume, store.isMuted])

  // ── Fullscreen change → store ─────────────────────────────
  useEffect(() => {
    const onFsChange = () => store.setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
    }

    const onKey = (e) => {
      if (isTyping()) return
      const video = videoRef.current
      if (!video) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          video.paused ? video.play() : video.pause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 5)
          break
        case 'ArrowRight':
          e.preventDefault()
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 5)
          break
        case 'KeyM':
          store.toggleMute()
          break
        case 'KeyF':
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ── Imperative controls ───────────────────────────────────
  const play  = useCallback(() => {
    store.setPlaybackError(null)
    const promise = videoRef.current?.play()
    promise?.catch((err) => {
      console.error('[VideoPlayer] Play interrupted:', err)
      // Only set error if not cleanly aborted by user pausing immediately
      if (err.name !== 'AbortError') {
        store.setPlaybackError(err.message || 'Playback failed')
      }
      usePlayerStore.getState().setIsPlaying(false)
    })
  }, [store])
  const pause = useCallback(() => videoRef.current?.pause(), [])

  const seek = useCallback((time) => {
    if (videoRef.current) videoRef.current.currentTime = time
    store.setCurrentTime(time)
  }, [])

  const setVolume = useCallback((v) => {
    if (videoRef.current) videoRef.current.volume = v
    store.setVolume(v)
  }, [store])

  const toggleFullscreen = useCallback(async () => {
    const container = videoRef.current?.closest('[data-fullscreen-root]')
    if (!document.fullscreenElement) {
      await (container ?? videoRef.current)?.requestFullscreen?.()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  return { videoRef, play, pause, seek, setVolume, toggleFullscreen }
}
