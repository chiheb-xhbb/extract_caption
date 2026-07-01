import { useState } from 'react'
import { FolderPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const MAX_NAME_LEN = 80

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onCreate: (data: { name: string, description?: string }) => Promise<void>,
 *   isLoading: boolean
 * }} props
 */
export function CreateProjectModal({ open, onClose, onCreate, isLoading }) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [error, setError]             = useState('')

  const handleClose = () => {
    if (isLoading) return
    setName('')
    setDescription('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Project name is required.')
      return
    }
    setError('')
    await onCreate({ name: trimmed, description: description.trim() || undefined })
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Project" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Input
            label="Project name"
            placeholder="My Awesome Video"
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NAME_LEN) setName(e.target.value)
            }}
            error={error}
            autoFocus
          />
          <p className="text-xs text-right" style={{ color: 'var(--color-text-disabled)' }}>
            {name.length}/{MAX_NAME_LEN}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of this project…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none transition-all duration-[var(--duration-fast)]"
            style={{
              background: 'var(--color-bg-overlay)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!name.trim()}>
            <FolderPlus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
