import axios from 'axios'
import { toast } from 'sonner'

/**
 * Centralised Axios instance.
 *
 * All requests automatically:
 *  - Prepend the API base URL from env
 *  - Send JSON content-type
 *  - Normalise error responses into a consistent shape
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000,
})

// ── Request interceptor ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Auth token will be injected here in a future sprint
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.'

    // 422 — validation errors bubble up to React Hook Form; don't toast.
    if (status === 422) {
      return Promise.reject(error)
    }

    // 5xx — server errors
    if (status >= 500) {
      toast.error('Server error. Please try again later.', { id: 'server-error' })
    }

    // Network failure — stable id prevents toast spam during TanStack Query retries
    if (!error.response) {
      toast.error('Network error. Check your connection.', { id: 'network-error' })
    }

    // Attach normalised message for consumer hooks
    error.normalizedMessage = message
    return Promise.reject(error)
  },
)

export default api
