import { useState } from 'react'
import { Download, Play, FileText, Subtitles, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useExport } from '@/hooks/useExport'
import { EXPORT_FORMATS } from '@/config/constants'

const FORMAT_ICONS = {
  mp4: Play,
  srt: FileText,
  vtt: FileText,
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   projectId: number|string
 * }} props
 */
export function ExportModal({ open, onClose, projectId }) {
  const [format, setFormat] = useState('srt')

  const { exportVideo, isExporting, progress, error, resetError } = useExport(projectId)

  const handleExport = () => {
    resetError()
    exportVideo(format)
  }

  const handleClose = () => {
    if (!isExporting) onClose()
  }

  const selectedFormat = EXPORT_FORMATS.find((f) => f.value === format)

  return (
    <Modal open={open} onClose={handleClose} title="Export Project" size="md">
      <div className="space-y-5">

        {!isExporting && !error && (
          <>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Choose an export format for your project.
            </p>

            {/* Format cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {EXPORT_FORMATS.map(({ value, label, description }) => {
                const Icon = FORMAT_ICONS[value] ?? FileText
                const isSelected = format === value

                return (
                  <button
                    key={value}
                    onClick={() => setFormat(value)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 text-left transition-all duration-[var(--duration-fast)] cursor-pointer hover:border-[var(--color-border-strong)]"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      background:  isSelected ? 'var(--color-primary-muted)' : 'var(--color-bg-overlay)',
                    }}
                    aria-pressed={isSelected}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-bg-base)' }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {label}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                        {description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 absolute" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export {selectedFormat?.label}
              </Button>
            </div>
          </>
        )}

        {error && !isExporting && (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 animate-slide-up">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}
            >
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Export Failed</h4>
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleExport}>Try Again</Button>
            </div>
          </div>
        )}

        {isExporting && (
          <div className="flex flex-col items-center justify-center py-4 space-y-5 animate-scale-in">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-primary)' }} />

            <div className="w-full space-y-2 text-center">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {format === 'mp4' ? 'Rendering Video…' : 'Generating Subtitles…'}
              </h4>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Please don't close this window.
              </p>

              <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-bg-overlay)' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  }}
                />
              </div>
              <p className="text-xs tabular-nums font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {progress}%
              </p>
            </div>
          </div>
        )}

      </div>
    </Modal>
  )
}
