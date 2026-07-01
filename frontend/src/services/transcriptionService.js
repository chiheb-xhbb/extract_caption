import api from '@/lib/axios'
import { API } from '@/config/api'

/**
 * Transcription API service.
 *
 * Laravel Resource responses are wrapped in { "data": ... }.
 * The function unwraps the envelope so callers always receive
 * a plain project object.
 */

/**
 * Trigger transcription for a project.
 * The backend queues the Whisper AI job and responds with the updated project.
 *
 * @param {number} projectId
 * @returns {Promise<import('@/types/project').Project>}
 */
export async function triggerTranscription(projectId) {
  const { data } = await api.post(API.projects.transcribe(projectId), null, {
    timeout: 0, // Whisper transcription can take minutes — no timeout
  })
  return data?.data ?? data
}
