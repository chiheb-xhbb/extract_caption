import { Link } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/routes'

export default function NotFoundPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 text-center"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Animated number */}
      <div className="relative select-none">
        <span
          className="text-[120px] font-black leading-none tracking-tight gradient-text"
          style={{ opacity: 0.15 }}
          aria-hidden="true"
        >
          404
        </span>
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center gradient-primary"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-w-sm animate-slide-up">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Page not found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <Button as={Link} to={ROUTES.dashboard} size="md">
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </div>
  )
}
