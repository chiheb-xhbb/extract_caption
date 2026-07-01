import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   isLoading: boolean
 * }} props
 */
export function DeleteCaptionDialog({ open, onClose, onConfirm, isLoading }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}
        >
          <Trash2 className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Delete caption?
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This caption will be permanently removed. This cannot be undone.
          </p>
        </div>

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
