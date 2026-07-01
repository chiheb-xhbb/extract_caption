import { CheckCircle2, Loader2, UploadCloud, AlertCircle, Cpu } from 'lucide-react'
import { cn } from '@/lib/cn'

const PHASES = {
  uploading: {
    icon: UploadCloud,
    label: 'Uploading video…',
    sub: 'Please keep this window open.',
    color: 'var(--color-primary)',
  },
  transcribing: {
    icon: Cpu,
    label: 'Transcribing audio…',
    sub: 'AI is generating captions. This may take a few minutes.',
    color: 'var(--color-accent)',
  },
  success: {
    icon: CheckCircle2,
    label: 'Done!',
    sub: 'Redirecting to editor…',
    color: 'var(--color-success)',
  },
  error: {
    icon: AlertCircle,
    label: 'Something went wrong',
    sub: '',
    color: 'var(--color-danger)',
  },
}

/**
 * @param {{
 *   file: File|null,
 *   progress: number,
 *   status: string,
 *   errorMessage: string|null
 * }} props
 */
export function UploadProgress({ file, progress, status, errorMessage }) {
  const phase = PHASES[status] ?? PHASES.uploading
  const Icon  = phase.icon
  const isUploading = status === 'uploading'

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center animate-slide-up">

      {/* Animated icon */}
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: `${phase.color}15`, color: phase.color }}
      >
        <Icon className={cn('w-7 h-7', status === 'transcribing' && 'animate-spin-slow')} />
        {(status === 'uploading' || status === 'transcribing') && (
          <div
            className="absolute inset-0 rounded-2xl animate-pulse-glow"
            style={{ '--tw-shadow-color': `${phase.color}30` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {phase.label}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {errorMessage ?? phase.sub}
        </p>
        {file && (
          <p className="text-xs font-mono truncate max-w-[260px] mx-auto" style={{ color: 'var(--color-text-disabled)' }}>
            {file.name}
          </p>
        )}
      </div>

      {/* Progress bar (upload phase only) */}
      {isUploading && (
        <div className="w-full space-y-2">
          <div
            className="relative h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--color-bg-overlay)' }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
              }}
            />
            {progress < 100 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full progress-stripe"
                style={{ width: `${progress}%`, opacity: 0.4 }}
              />
            )}
          </div>
          <p className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {progress}%
          </p>
        </div>
      )}

      {/* Transcribing spinner dots */}
      {status === 'transcribing' && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: 'var(--color-accent)',
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
