import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS } from '@/config/constants'
import { updateCaption } from '@/services/captionService'
import { useEditorStore } from '@/store/editorStore'

export function useEditCaption(projectId) {
  const record = useEditorStore((s) => s.record)

  const editMutation = useMutation({
    mutationFn: ({ captionId, payload }) =>
      updateCaption(projectId, captionId, payload),

    onMutate: async ({ captionId, payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.captions(projectId) })

      const previousCaptions = queryClient.getQueryData(QUERY_KEYS.captions(projectId))
      const previous = previousCaptions?.find?.((c) => c.id === captionId)

      queryClient.setQueryData(QUERY_KEYS.captions(projectId), (old) => {
        if (!old) return old
        return old.map((c) =>
          c.id === captionId ? { ...c, ...payload } : c
        )
      })

      if (previous) {
        const before = {}
        const after  = {}
        for (const key of Object.keys(payload)) {
          before[key] = previous[key]
          after[key]  = payload[key]
        }
        record(captionId, before, after)
      }

      return { previousCaptions }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousCaptions) {
        queryClient.setQueryData(QUERY_KEYS.captions(projectId), context.previousCaptions)
      }
      toast.error('Failed to save — change reverted')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.captions(projectId) })
    },
  })

  return {
    editCaption:      editMutation.mutate,
    editCaptionAsync: editMutation.mutateAsync,
    isSaving:         editMutation.isPending,
  }
}
