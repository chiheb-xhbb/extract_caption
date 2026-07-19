import { Link } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/routes'

export default function NotFoundPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 text-center animate-fade-in"
      style={{ background: 'var(--background)' }}
    >
      {/* Decor number */}
      <div className="relative select-none">
        <span
          aria-hidden="true"
          className="gradient-text"
          style={{ fontSize: 128, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em', opacity: 0.12 }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center gradient-primary"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            <Zap width={28} height={28} style={{ fill: '#fff', color: '#fff' }} />
          </div>
        </div>
      </div>

      <div className="animate-slide-up" style={{ maxWidth: 300 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <Button as={Link} to={ROUTES.dashboard} size="md">
        <Home width={15} height={15} />
        Back to Dashboard
      </Button>
    </div>
  )
}
