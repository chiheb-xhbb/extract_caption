import { create } from 'zustand'

/**
 * Upload UI state. Tracks a single pending upload.
 * The actual HTTP request lives in the useUpload hook.
 */
export const useUploadStore = create((set) => ({
  /** @type {File|null} */
  file: null,

  /** @type {'idle'|'validating'|'uploading'|'transcribing'|'success'|'error'} */
  status: 'idle',

  /** 0–100 */
  progress: 0,

  /** @type {string|null} */
  errorMessage: null,

  /** @type {string|null} Preview object URL (revoked on cleanup) */
  previewUrl: null,

  setFile: (file) => {
    const previewUrl = file ? URL.createObjectURL(file) : null
    set({ file, previewUrl, status: 'idle', progress: 0, errorMessage: null })
  },

  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (message) => set({ status: 'error', errorMessage: message }),

  reset: () => {
    set((state) => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
      return {
        file: null,
        status: 'idle',
        progress: 0,
        errorMessage: null,
        previewUrl: null,
      }
    })
  },
}))
