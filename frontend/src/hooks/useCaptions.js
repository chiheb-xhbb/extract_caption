import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS } from '@/config/constants'
import { fetchCaptions, deleteCaption } from '@/services/captionService'

/**
 * Hook to manage captions for a specific project.
 * Handles fetching and optimistic deletion.
 * @param {number|string} projectId 
 */
export function useCaptions(projectId) {
  const query = useQuery({
    queryKey: QUERY_KEYS.captions(projectId),
    queryFn: () => fetchCaptions(projectId),
    enabled: !!projectId,
  })

  const removeMutation = useMutation({
    mutationFn: (captionId) => deleteCaption(projectId, captionId),
    onMutate: async (captionId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.captions(projectId) })
      const previous = queryClient.getQueryData(QUERY_KEYS.captions(projectId))
      
      queryClient.setQueryData(QUERY_KEYS.captions(projectId), (old) => 
        old ? old.filter(c => c.id !== captionId) : []
      )
      
      return { previous }
    },
    onError: (err, captionId, context) => {
      queryClient.setQueryData(QUERY_KEYS.captions(projectId), context.previous)
      toast.error(err.normalizedMessage ?? 'Failed to delete caption')
    },
    onSuccess: () => {
      toast.success('Caption deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.captions(projectId) })
    },
  })

  return {
    captions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteCaption: removeMutation.mutate,
    isDeleting: removeMutation.isPending,
  }
}
