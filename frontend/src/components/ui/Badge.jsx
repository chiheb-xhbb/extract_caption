import { cn } from '@/lib/cn'

export const STATUS_VARIANT = {
  draft:        'default',
  pending:      'warning',
  transcribing: 'info',
  ready:        'success',
  completed:    'success',
  failed:       'danger',
  error:        'danger',
  processing:   'info',
}

const variantStyles = {
  default: {
    background: 'var(--color-bg-muted)',
    color: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
  },
  success: {
    background: 'var(--color-success-muted)',
    color: 'var(--color-success)',
    border: 'rgba(34,197,94,0.2)',
  },
  warning: {
    background: 'var(--color-warning-muted)',
    color: 'var(--color-warning)',
    border: 'rgba(245,158,11,0.2)',
  },
  danger: {
    background: 'var(--color-danger-muted)',
    color: 'var(--color-danger)',
    border: 'rgba(239,68,68,0.2)',
  },
  info: {
    background: 'var(--color-info-muted)',
    color: 'var(--color-info)',
    border: 'rgba(59,130,246,0.2)',
  },
  primary: {
    background: 'var(--color-primary-muted)',
    color: 'var(--color-primary-light)',
    border: 'rgba(99,102,241,0.2)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
  },
}

/**
 * @param {{
 *   variant?: keyof variantStyles,
 *   dot?: boolean,
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export function Badge({ variant = 'default', dot = false, children, className }) {
  const styles = variantStyles[variant] ?? variantStyles.default

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
        className,
      )}
      style={{
        background: styles.background,
        color: styles.color,
        borderColor: styles.border,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: styles.color }}
        />
      )}
      {children}
    </span>
  )
}
