/**
 * API endpoint builders.
 *
 * All endpoints are functions that produce strings, so callers
 * never concatenate strings manually. If the backend URL structure
 * changes, only this file needs updating.
 */
export const API = {
  projects: {
    list:       ()         => '/projects',
    create:     ()         => '/projects',
    detail:     (id)       => `/projects/${id}`,
    update:     (id)       => `/projects/${id}`,
    destroy:    (id)       => `/projects/${id}`,
    upload:     (id)       => `/projects/${id}/upload`,
    transcribe: (id)       => `/projects/${id}/transcribe`,
  },

  captions: {
    list:   (projectId)              => `/projects/${projectId}/captions`,
    update: (projectId, captionId)   => `/projects/${projectId}/captions/${captionId}`,
    destroy:(projectId, captionId)   => `/projects/${projectId}/captions/${captionId}`,
    merge:  (projectId)              => `/projects/${projectId}/captions/merge`,
  },

  exports: {
    trigger: (projectId) => `/projects/${projectId}/export`,
  },
}
