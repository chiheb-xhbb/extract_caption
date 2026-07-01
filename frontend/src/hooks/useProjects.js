import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { QUERY_KEYS } from '@/config/constants'
import {
  fetchProjects,
  createProject,
  deleteProject,
} from '@/services/projectService'

/**
 * Provides the full projects list with create and delete mutations.
 * Server state only — Zustand is not touched here.
 */
export function useProjects() {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn:  fetchProjects,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.setQueryData(QUERY_KEYS.projects, (prev) =>
        prev ? [newProject, ...prev] : [newProject],
      )
      toast.success('Project created')
    },
    onError: (err) => {
      toast.error(err.normalizedMessage ?? 'Failed to create project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      // Optimistic update — remove from cache immediately
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.projects })
      const previous = queryClient.getQueryData(QUERY_KEYS.projects)
      queryClient.setQueryData(QUERY_KEYS.projects, (prev) =>
        prev ? prev.filter((p) => p.id !== id) : [],
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(QUERY_KEYS.projects, ctx.previous)
      toast.error('Failed to delete project')
    },
    onSuccess: () => {
      toast.success('Project deleted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects })
    },
  })

  return {
    projects:      query.data ?? [],
    isLoading:     query.isLoading,
    isError:       query.isError,
    error:         query.error,
    refetch:       query.refetch,
    createProject: createMutation.mutateAsync,
    isCreating:    createMutation.isPending,
    deleteProject: deleteMutation.mutate,
    isDeleting:    deleteMutation.isPending,
    deletingId:    deleteMutation.variables,
  }
}
