import api from '@/lib/axios'
import { API } from '@/config/api'

/**
 * Upload API service.
 * Uses FormData for multipart upload with Axios onUploadProgress.
 *
 * Laravel Resource responses are wrapped in { "data": ... }.
 * The function unwraps the envelope so callers always receive
 * a plain project object.
 */

/**
 * @param {number} projectId
 * @param {File} file
 * @param {(progress: number) => void} onProgress - Callback with 0-100 value
 * @returns {Promise<import('@/types/project').Project>}
 */
export async function uploadVideo(projectId, file, onProgress) {
  const formData = new FormData()
  formData.append('video', file)

  const { data } = await api.post(API.projects.upload(projectId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total)
        onProgress?.(percent)
      }
    },
  })

  return data?.data ?? data
}
