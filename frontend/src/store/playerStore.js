import { create } from 'zustand'
import { PLAYBACK_SPEEDS } from '@/config/constants'

/**
 * Video player UI state.
 * Synced from the <video> element via useVideoPlayer hook.
 * TanStack Query never writes here — this is ephemeral playback state.
 */
export const usePlayerStore = create((set) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isMuted: false,
  volume: 1,
  speed: 1,
  isFullscreen: false,
  isReady: false,
  isBuffering: false,
  playbackError: null,
  requestedTime: null,

  setCurrentTime: (time) => set({ currentTime: time }),
  requestSeek: (time) => set({ currentTime: time, requestedTime: time }),
  setDuration: (duration) => set({ duration, isReady: duration > 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setPlaybackError: (playbackError) => set({ playbackError }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  /**
   * Cycle to the next playback speed in the preset list.
   */
  cycleSpeed: () =>
    set((s) => {
      const idx = PLAYBACK_SPEEDS.indexOf(s.speed)
      const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]
      return { speed: next }
    }),

  setSpeed: (speed) => set({ speed }),

  reset: () =>
    set({
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isReady: false,
      isBuffering: false,
      playbackError: null,
      speed: 1,
    }),
}))
