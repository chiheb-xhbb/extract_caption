import { create } from 'zustand'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS } from '@/config/constants'

const MAX_HISTORY = 50

/**
 * @typedef {{ captionId: number, before: object, after: object }} HistoryEntry
 */

function applyEntry(entry, snapshot, projectId) {
  const { captionId } = entry

  const captionFields = {}
  const styleFields   = {}

  for (const [k, v] of Object.entries(snapshot)) {
    if (k === 'style') {
      Object.assign(styleFields, v)
    } else {
      captionFields[k] = v
    }
  }

  if (Object.keys(captionFields).length > 0) {
    queryClient.setQueryData(QUERY_KEYS.captions(projectId), (old) => {
      if (!old) return old
      return old.map((c) => (c.id === captionId ? { ...c, ...captionFields } : c))
    })
  }

  if (Object.keys(styleFields).length > 0) {
    import('@/store/captionStyleStore').then(({ useCaptionStyleStore }) => {
      useCaptionStyleStore.getState().setStyle(captionId, {
        ...useCaptionStyleStore.getState().getStyle(captionId),
        ...styleFields,
      })
    })
  }
}

export const useEditorStore = create((set, get) => ({
  selectedCaptionId: null,
  editingCaptionId:  null,
  past:   [],
  future: [],

  setSelectedCaption: (id) =>
    set({ selectedCaptionId: id, editingCaptionId: null }),

  setEditingCaption: (id) => set({ editingCaptionId: id }),
  clearEditing:      ()  => set({ editingCaptionId: null }),

  record: (captionId, before, after) =>
    set((s) => ({
      past:   [...s.past, { captionId, before, after }].slice(-MAX_HISTORY),
      future: [],
    })),

  undo: (projectId) => {
    const { past, future } = get()
    if (past.length === 0) return
    const entry = past[past.length - 1]
    set({ past: past.slice(0, -1), future: [entry, ...future] })
    applyEntry(entry, entry.before, projectId)
  },

  redo: (projectId) => {
    const { past, future } = get()
    if (future.length === 0) return
    const entry = future[0]
    set({ past: [...past, entry], future: future.slice(1) })
    applyEntry(entry, entry.after, projectId)
  },

  clearHistory: () => set({ past: [], future: [] }),

  pushUndo: (captionId, previousText) =>
    set((s) => ({
      past:   [...s.past, { captionId, before: { text: previousText }, after: {} }].slice(-MAX_HISTORY),
      future: [],
    })),
}))
