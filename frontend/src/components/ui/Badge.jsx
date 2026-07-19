import { cn } from '@/lib/cn'
import './Badge.css'

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

/**
 * @param {{
 *   variant?: 'default'|'success'|'warning'|'danger'|'info'|'primary'|'outline',
 *   dot?: boolean,
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export function Badge({ variant = 'default', dot = false, children, className }) {
  const isTranscribing = variant === 'info'

  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {dot && (
        <span
          className={cn('badge-dot', isTranscribing && 'pulse')}
          style={{ background: 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}
