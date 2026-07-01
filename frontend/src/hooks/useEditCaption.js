import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS } from '@/config/constants'
import { updateCaption } from '@/services/captionService'
import { useEditorStore } from '@/store/editorStore'

/**
 * Hook for inline editing a caption text.
 * Implements optimistic updates, rolling back on error.
 * Uses editorStore for undo stack history.
 * 
 * @param {number|string} projectId 
 */
export function useEditCaption(projectId) {
  const pushUndo = useEditorStore((s) => s.pushUndo)

  const editMutation = useMutation({
    mutationFn: ({ captionId, payload }) => updateCaption(projectId, captionId, payload),
    onMutate: async ({ captionId, payload, previousText }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.captions(projectId) })
      
      const previousCaptions = queryClient.getQueryData(QUERY_KEYS.captions(projectId))
      
      // Optimistically update the UI
      queryClient.setQueryData(QUERY_KEYS.captions(projectId), (old) => {
        if (!old) return old
        return old.map(c => c.id === captionId ? { ...c, text: payload.text } : c)
      })

      // Push original text to undo stack
      if (previousText !== undefined) {
        pushUndo(captionId, previousText)
      }

      return { previousCaptions }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(QUERY_KEYS.captions(projectId), context.previousCaptions)
      toast.error(err.normalizedMessage ?? 'Failed to save caption edit')
    },
    onSettled: () => {
      // Invalidate to make sure we are synced with server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.captions(projectId) })
    }
  })

  return {
    editCaption: editMutation.mutate,
    editCaptionAsync: editMutation.mutateAsync,
    isSaving: editMutation.isPending
  }
}
