import { useState } from 'react'
import { Download, Play, FileText, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useExport } from '@/hooks/useExport'
import { EXPORT_FORMATS } from '@/config/constants'
import { cn } from '@/lib/cn'
import './ExportModal.css'

const FORMAT_ICONS = {
  mp4: Play,
  srt: FileText,
  vtt: FileText,
}

export function ExportModal({ open, onClose, projectId }) {
  const [format, setFormat] = useState('srt')
  const { exportVideo, isExporting, progress, error, resetError } = useExport(projectId)

  const handleExport = () => { resetError(); exportVideo(format) }
  const handleClose  = () => { if (!isExporting) onClose() }
  const selectedFormat = EXPORT_FORMATS.find((f) => f.value === format)

  return (
    <Modal open={open} onClose={handleClose} title="Export Project" size="md">

      {!isExporting && !error && (
        <>
          <p className="export-intro">Choose an export format for your project.</p>

          <div className="export-formats-grid">
            {EXPORT_FORMATS.map(({ value, label, description }) => {
              const Icon       = FORMAT_ICONS[value] ?? FileText
              const isSelected = format === value
              return (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={cn('export-format-btn', isSelected && 'selected')}
                  aria-pressed={isSelected}
                >
                  <div className="export-format-icon">
                    <Icon width={16} height={16} />
                  </div>
                  <p className="export-format-name">{label}</p>
                  <p className="export-format-desc">{description}</p>
                  {isSelected && (
                    <CheckCircle2 width={14} height={14} className="export-format-check" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="export-footer">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleExport}>
              <Download width={13} height={13} />
              Export {selectedFormat?.label}
            </Button>
          </div>
        </>
      )}

      {error && !isExporting && (
        <div className="export-error-wrap">
          <div className="export-error-icon">
            <RotateCcw width={22} height={22} />
          </div>
          <h4 className="export-error-title">Export Failed</h4>
          <p className="export-error-msg">{error}</p>
          <div className="export-error-actions">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleExport}>Try Again</Button>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="export-progress-wrap">
          <Loader2 width={36} height={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <h4 className="export-progress-title">
            {format === 'mp4' ? 'Rendering Video…' : 'Generating Subtitles…'}
          </h4>
          <p className="export-progress-hint">Please don't close this window.</p>
          <div className="export-progress-bar-wrap" style={{ width: '100%' }}>
            <div className="export-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="export-progress-pct">{progress}%</p>
        </div>
      )}

    </Modal>
  )
}
