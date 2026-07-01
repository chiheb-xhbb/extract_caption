import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   isLoading: boolean,
 *   projectName: string
 * }} props
 */
export function DeleteProjectDialog({ open, onClose, onConfirm, isLoading, projectName }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Delete project?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              "{projectName}"
            </span>{' '}
            and all its captions will be permanently deleted. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isLoading} className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
