import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import './Modal.css'

const sizeMap = {
  sm:   'sm',
  md:   'md',
  lg:   'lg',
  xl:   'xl',
  full: 'full',
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full',
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export function Modal({ open, onClose, title, size = 'md', children, className }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !panelRef.current) return
    const el = panelRef.current.querySelector('button, input, textarea, select, [tabindex]')
    el?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        className={cn('modal-panel', sizeMap[size] ?? 'md', className)}
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close dialog"
            >
              <X width={15} height={15} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
