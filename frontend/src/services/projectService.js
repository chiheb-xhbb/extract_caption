import api from '@/lib/axios'
import { API } from '@/config/api'

/**
 * Project API service.
 *
 * Laravel Resource responses are wrapped in { "data": ... }.
 * Every function unwraps the envelope so callers always receive
 * plain objects / arrays — no component should know the response shape.
 */

/** @returns {Promise<import('@/types/project').Project[]>} */
export async function fetchProjects() {
  const { data } = await api.get(API.projects.list())
  return data?.data ?? data
}

/**
 * @param {number} id
 * @returns {Promise<import('@/types/project').Project>}
 */
export async function fetchProject(id) {
  const { data } = await api.get(API.projects.detail(id))
  return data?.data ?? data
}

/**
 * @param {{ name: string, description?: string }} payload
 * @returns {Promise<import('@/types/project').Project>}
 */
export async function createProject(payload) {
  const { data } = await api.post(API.projects.create(), payload)
  return data?.data ?? data
}

/**
 * @param {number} id
 * @param {{ name?: string, description?: string }} payload
 * @returns {Promise<import('@/types/project').Project>}
 */
export async function updateProject(id, payload) {
  const { data } = await api.put(API.projects.update(id), payload)
  return data?.data ?? data
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await api.delete(API.projects.destroy(id))
}
