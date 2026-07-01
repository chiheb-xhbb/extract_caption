import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Film, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UploadProgress } from '@/components/video/UploadProgress'
import { useUpload } from '@/hooks/useUpload'
import { ACCEPTED_VIDEO_TYPES, MAX_UPLOAD_SIZE_BYTES } from '@/config/constants'
import { cn } from '@/lib/cn'

/**
 * Full upload zone — drag & drop with validation, progress, and transcription state.
 * @param {{ projectId: number|string }} props
 */
export function UploadZone({ projectId }) {
  const { upload, reset, status, progress, file, errorMessage } = useUpload(projectId)

  const isActive = ['uploading', 'transcribing'].includes(status)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) upload(accepted[0])
  }, [upload])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept:    ACCEPTED_VIDEO_TYPES,
    maxSize:   MAX_UPLOAD_SIZE_BYTES,
    maxFiles:  1,
    disabled:  isActive,
    noClick:   isActive,
    noDrag:    isActive,
  })

  const rejectionError = fileRejections[0]?.errors[0]?.message ?? null

  // Show progress view while uploading or transcribing
  if (isActive || (status === 'error' && file)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6"
           style={{ background: 'var(--color-bg-base)' }}>
        <UploadProgress
          file={file}
          progress={progress}
          status={status}
          errorMessage={errorMessage}
        />
        {status === 'error' && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-8"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-primary-muted)' }}
          >
            <Film className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Upload your video
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          MP4, MOV, AVI, MKV or WebM · Max 500 MB
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-5 w-full max-w-lg',
          'rounded-2xl border-2 border-dashed p-12 cursor-pointer',
          'transition-all duration-200',
          isDragActive
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] scale-[1.01]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.02]',
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-transform',
            isDragActive && 'scale-110',
          )}
          style={{
            background: isDragActive ? 'var(--color-primary-muted)' : 'var(--color-bg-overlay)',
          }}
        >
          <UploadCloud
            className="w-8 h-8"
            style={{ color: isDragActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            or click to browse
          </p>
        </div>
      </div>

      {/* Validation errors */}
      {(rejectionError || errorMessage) && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm max-w-lg w-full"
          style={{
            background:  'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.2)',
            border:      '1px solid',
            color:       'var(--color-danger)',
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {rejectionError ?? errorMessage}
        </div>
      )}
    </div>
  )
}
