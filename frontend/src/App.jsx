import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import AppRouter from '@/routes'

/**
 * App — root provider tree.
 *
 * Provider order (outermost → innermost):
 *  1. QueryClientProvider  — TanStack Query (server state)
 *  2. AppRouter            — React Router (routing + outlets)
 *  3. Toaster              — Sonner (portal, outside normal tree)
 *
 * Zustand stores are module-level singletons — no Provider needed.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          },
        }}
        richColors
        closeButton
      />
    </QueryClientProvider>
  )
}
