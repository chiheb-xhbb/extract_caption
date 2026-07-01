import api from '@/lib/axios'
import { API } from '@/config/api'

/**
 * Export API service.
 *
 * Laravel Resource responses are wrapped in { "data": ... }.
 * The function unwraps the envelope so callers always receive
 * a plain export response object.
 */

/**
 * Trigger an export and return the download URL.
 *
 * @param {number} projectId
 * @param {import('@/types/export').ExportRequest} payload
 * @returns {Promise<import('@/types/export').ExportResponse>}
 */
export async function triggerExport(projectId, payload) {
  const { data } = await api.post(API.exports.trigger(projectId), payload)
  return data?.data ?? data
}
