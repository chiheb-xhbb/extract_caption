import api from '@/lib/axios'
import { API } from '@/config/api'

/**
 * Caption API service.
 *
 * Laravel Resource responses are wrapped in { "data": ... }.
 * Every function unwraps the envelope so callers always receive
 * plain objects / arrays — no component should know the response shape.
 */

/**
 * @param {number} projectId
 * @returns {Promise<import('@/types/caption').Caption[]>}
 */
export async function fetchCaptions(projectId) {
  const { data } = await api.get(API.captions.list(projectId))
  return data?.data ?? data
}

/**
 * @param {number} projectId
 * @param {number} captionId
 * @param {{ text?: string, start?: number, end?: number }} payload
 * @returns {Promise<import('@/types/caption').Caption>}
 */
export async function updateCaption(projectId, captionId, payload) {
  const { data } = await api.put(API.captions.update(projectId, captionId), payload)
  return data?.data ?? data
}

/**
 * @param {number} projectId
 * @param {number} captionId
 * @returns {Promise<void>}
 */
export async function deleteCaption(projectId, captionId) {
  await api.delete(API.captions.destroy(projectId, captionId))
}

/**
 * @param {number} projectId
 * @param {{ caption_ids: number[] }} payload
 * @returns {Promise<import('@/types/caption').Caption>}
 */
export async function mergeCaptions(projectId, payload) {
  const { data } = await api.post(API.captions.merge(projectId), payload)
  return data?.data ?? data
}
