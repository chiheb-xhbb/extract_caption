import { create } from 'zustand'

/**
 * Global UI layout state.
 * Manages panel sizes, sidebar collapse, and modal visibility.
 * This is purely presentation state — no business logic.
 */
export const useUIStore = create((set) => ({
  /** Sidebar collapsed state */
  sidebarCollapsed: false,

  /** Editor panel sizes (pixels) */
  panelSizes: {
    leftPanel: 320,   // Captions list
    rightPanel: 300,  // Style panel
    bottomPanel: 220, // Timeline
  },

  /** Active modal identifier */
  activeModal: null,

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setPanelSize: (panel, value) =>
    set((s) => ({
      panelSizes: { ...s.panelSizes, [panel]: value },
    })),

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}))

/** Modal identifiers — avoids typo bugs */
export const MODAL_IDS = {
  createProject: 'create-project',
  deleteProject: 'delete-project',
  export:        'export',
  uploadVideo:   'upload-video',
}
