import { Loader2 } from 'lucide-react'

/**
 * Full-screen spinner used as the Suspense fallback during page transitions.
 */
export default function GlobalSpinner() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--color-bg-base)', zIndex: 'var(--z-toast)' }}
    >
      <div className="relative">
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: 'var(--color-primary)' }}
        />
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{ '--tw-shadow-color': 'var(--color-primary-glow)' }}
        />
      </div>
    </div>
  )
}
