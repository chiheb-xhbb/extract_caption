import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUploadStore } from '@/store/uploadStore'
import { queryClient } from '@/lib/queryClient'
import { uploadVideo } from '@/services/uploadService'
import { triggerTranscription } from '@/services/transcriptionService'
import { QUERY_KEYS, MAX_UPLOAD_SIZE_BYTES, ACCEPTED_VIDEO_TYPES } from '@/config/constants'
import { ROUTES } from '@/config/routes'

/**
 * Manages the full upload → transcribe → navigate flow for a project.
 * @param {number|string} projectId
 */
export function useUpload(projectId) {
  const navigate = useNavigate()
  const store = useUploadStore()

  const transcribeMutation = useMutation({
    mutationFn: () => triggerTranscription(projectId),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(QUERY_KEYS.project(projectId), updatedProject)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })
      store.setStatus('success')
      toast.success('Transcription complete!')
      navigate(ROUTES.editor(projectId), { replace: true })
    },
    onError: (err) => {
      store.setError(err.normalizedMessage ?? 'Transcription failed. Please try again.')
      toast.error(err.normalizedMessage ?? 'Transcription failed')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      uploadVideo(projectId, file, (pct) => store.setProgress(pct)),
    onMutate: () => store.setStatus('uploading'),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(QUERY_KEYS.project(projectId), updatedProject)
      store.setProgress(100)
      store.setStatus('transcribing')
      toast.loading('Transcribing audio…', { id: 'transcribe-progress' })
      transcribeMutation.mutate()
    },
    onError: (err) => {
      store.setError(err.normalizedMessage ?? 'Upload failed. Please try again.')
      toast.error(err.normalizedMessage ?? 'Upload failed')
    },
    onSettled: () => {
      toast.dismiss('transcribe-progress')
    },
  })

  /**
   * Validates and starts upload for a single file.
   * @param {File} file
   */
  const upload = useCallback((file) => {
    store.setStatus('validating')

    const acceptedMimes = Object.keys(ACCEPTED_VIDEO_TYPES)
    if (!acceptedMimes.includes(file.type)) {
      store.setError('Unsupported file type. Please upload MP4, MOV, AVI, MKV or WebM.')
      return
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      store.setError(`File exceeds 500 MB limit (${(file.size / 1024 / 1024).toFixed(0)} MB).`)
      return
    }

    store.setFile(file)
    uploadMutation.mutate(file)
  }, [projectId, store, uploadMutation])

  return {
    upload,
    reset:          store.reset,
    status:         store.status,
    progress:       store.progress,
    file:           store.file,
    previewUrl:     store.previewUrl,
    errorMessage:   store.errorMessage,
    isUploading:    store.status === 'uploading',
    isTranscribing: store.status === 'transcribing',
    isError:        store.status === 'error',
  }
}
