import { create } from 'zustand'
import { DEFAULT_CAPTION_STYLE } from '@/config/captionStyle'

/**
 * Client-side per-caption style overrides.
 * Keyed by captionId. Separate from the server caption data so no backend
 * changes are required. Undo/redo is handled by editorStore recording
 * style snapshots in its past/future stacks.
 */
export const useCaptionStyleStore = create((set, get) => ({
  /** @type {Record<number, import('@/types/caption').CaptionStyle>} */
  styles: {},

  getStyle: (captionId) => ({
    ...DEFAULT_CAPTION_STYLE,
    ...(get().styles[captionId] ?? {}),
  }),

  setStyle: (captionId, style) =>
    set((s) => ({ styles: { ...s.styles, [captionId]: style } })),

  patchStyle: (captionId, patch) =>
    set((s) => ({
      styles: {
        ...s.styles,
        [captionId]: { ...DEFAULT_CAPTION_STYLE, ...(s.styles[captionId] ?? {}), ...patch },
      },
    })),

  clearStyle: (captionId) =>
    set((s) => {
      const next = { ...s.styles }
      delete next[captionId]
      return { styles: next }
    }),
}))
