import { cn } from '@/lib/cn'

/**
 * @param {{
 *   icon?: React.ReactNode,
 *   title: string,
 *   description?: string,
 *   action?: React.ReactNode,
 *   className?: string
 * }} props
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4 p-8 select-none',
        className,
      )}
    >
      {icon && (
        <div
          className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          {/* Soft glow ring */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ boxShadow: '0 0 24px rgba(99,102,241,0.1)' }}
          />
          {icon}
        </div>
      )}

      <div className="space-y-1.5 max-w-[240px]">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        {description && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
