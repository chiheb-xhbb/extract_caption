import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/config/constants'
import { fetchProject } from '@/services/projectService'

/**
 * Fetches and caches a single project by ID.
 * Used on the Editor page where full project detail is needed.
 *
 * @param {number|string|null} id
 */
export function useProject(id) {
  const query = useQuery({
    queryKey: QUERY_KEYS.project(id),
    queryFn:  () => fetchProject(id),
    enabled:  !!id,
  })

  return {
    project:   query.data ?? null,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  }
}
