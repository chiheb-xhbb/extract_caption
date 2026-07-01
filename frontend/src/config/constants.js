/**
 * Application-wide constants.
 * Never use magic values — reference these instead.
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'AutoCaption Studio'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL, globalThis.location?.origin ?? 'http://localhost:5173').origin
  } catch {
    return 'http://localhost:8000'
  }
})()

/**
 * Resolve Laravel media URLs for browser playback.
 *
 * Laravel may return:
 * - /storage/uploads/video.mp4
 * - storage/uploads/video.mp4
 * - http://localhost:8000/storage/uploads/video.mp4
 *
 * Vite serves the React app on a different origin, so root-relative storage
 * paths must be resolved against the Laravel origin, not window.location.
 */
export function resolveVideoUrl(url) {
  if (!url) return ''

  const value = String(url).trim()
  if (!value) return ''

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value
  }

  if (value.startsWith('//')) {
    return `${globalThis.location?.protocol ?? 'http:'}${value}`
  }

  return new URL(value.replace(/^\/+/, ''), `${API_ORIGIN}/`).href
}

// Accepted video MIME types for upload validation
export const ACCEPTED_VIDEO_TYPES = {
  'video/mp4':  ['.mp4'],
  'video/webm': ['.webm'],
  'video/mov':  ['.mov'],
  'video/avi':  ['.avi'],
  'video/mkv':  ['.mkv'],
}

// Max upload file size — 500 MB (matches backend UPLOAD_MAX_SIZE)
export const MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024

// Debounce delay for caption auto-save (ms)
export const CAPTION_AUTOSAVE_DELAY_MS = 800

// Timeline zoom and scaling
export const TIMELINE_BASE_PX_PER_SEC = 100 // Default 100px equals 1 second
export const TIMELINE_MIN_ZOOM  = 0.1
export const TIMELINE_MAX_ZOOM  = 20
export const TIMELINE_DEFAULT_ZOOM = 1

// Playback speed options
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

// Export formats
export const EXPORT_FORMATS = [
  { value: 'srt', label: 'SRT',  description: 'SubRip Subtitles' },
  { value: 'mp4', label: 'MP4',  description: 'Burned-in Subtitles' },
]

// Query keys — centralised to avoid key typos
export const QUERY_KEYS = {
  projects:       ['projects'],
  project:        (id)        => ['projects', id],
  captions:       (projectId) => ['captions', projectId],
}
