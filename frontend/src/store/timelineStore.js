import { create } from 'zustand'
import {
  TIMELINE_DEFAULT_ZOOM,
  TIMELINE_MIN_ZOOM,
  TIMELINE_MAX_ZOOM,
} from '@/config/constants'

/**
 * Timeline UI state.
 * Drives the visual representation of captions on the timeline ruler.
 * TanStack Query supplies the caption data; this store controls view state.
 */
export const useTimelineStore = create((set, get) => ({
  zoom: TIMELINE_DEFAULT_ZOOM,
  snapEnabled: true,

  /** @type {number|null} */
  selectedBlockId: null,

  /** Horizontal scroll offset in pixels */
  scrollLeft: 0,

  setZoom: (zoom) =>
    set({ zoom: Math.min(TIMELINE_MAX_ZOOM, Math.max(TIMELINE_MIN_ZOOM, zoom)) }),

  zoomIn: () => {
    const { zoom } = get()
    set({ zoom: Math.min(TIMELINE_MAX_ZOOM, +(zoom * 1.25).toFixed(2)) })
  },

  zoomOut: () => {
    const { zoom } = get()
    set({ zoom: Math.max(TIMELINE_MIN_ZOOM, +(zoom * 0.8).toFixed(2)) })
  },

  resetZoom: () => set({ zoom: TIMELINE_DEFAULT_ZOOM }),

  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  setSelectedBlock: (id) => set({ selectedBlockId: id }),

  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
}))
