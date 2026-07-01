import { create } from 'zustand'

/**
 * Editor UI state.
 *
 * Responsibilities (UI only — TanStack Query owns server data):
 *  - Which caption is currently selected
 *  - Which caption is being edited inline
 *  - Undo stack of caption IDs → text pairs (undo-ready architecture)
 */
export const useEditorStore = create((set, get) => ({
  /** @type {number|null} */
  selectedCaptionId: null,

  /** @type {number|null} */
  editingCaptionId: null,

  /** @type {Array<{captionId: number, text: string}>} */
  undoStack: [],

  /** @type {Array<{captionId: number, text: string}>} */
  redoStack: [],

  setSelectedCaption: (id) =>
    set({ selectedCaptionId: id, editingCaptionId: null }),

  setEditingCaption: (id) =>
    set({ editingCaptionId: id }),

  clearEditing: () =>
    set({ editingCaptionId: null }),

  /**
   * Push a text snapshot onto the undo stack before an edit begins.
   * @param {number} captionId
   * @param {string} previousText
   */
  pushUndo: (captionId, previousText) =>
    set((state) => ({
      undoStack: [...state.undoStack, { captionId, text: previousText }].slice(-50),
      redoStack: [],
    })),

  /**
   * Pop undo stack and return the previous state.
   * @returns {{captionId: number, text: string}|null}
   */
  popUndo: () => {
    const { undoStack, redoStack } = get()
    if (undoStack.length === 0) return null
    const previous = undoStack[undoStack.length - 1]
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, previous],
    })
    return previous
  },

  clearHistory: () =>
    set({ undoStack: [], redoStack: [] }),
}))
