const STORAGE_BASE = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000'

export function resolveVideoUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_BASE}${path}`
}
