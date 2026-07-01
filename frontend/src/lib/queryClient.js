import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client.
 *
 * Strategy:
 * - staleTime: 60s  — prevents re-fetching on every mount for stable data.
 * - retry: 2        — retries failed requests twice before showing an error.
 * - refetchOnWindowFocus: false — editor context; focus changes are frequent
 *   and auto-refetch would disrupt the user's editing workflow.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
