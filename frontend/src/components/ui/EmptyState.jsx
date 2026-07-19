import { cn } from '@/lib/cn'
import './EmptyState.css'

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
    <div className={cn('empty-state', className)}>
      {icon && (
        <div className="empty-state-icon-wrap">
          <div className="empty-state-icon-halo" />
          {icon}
        </div>
      )}

      <div className="empty-state-copy">
        <h3 className="empty-state-title">{title}</h3>
        {description && (
          <p className="empty-state-description">{description}</p>
        )}
      </div>

      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
