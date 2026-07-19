import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Film, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UploadProgress } from '@/components/video/UploadProgress'
import { useUpload } from '@/hooks/useUpload'
import { ACCEPTED_VIDEO_TYPES, MAX_UPLOAD_SIZE_BYTES } from '@/config/constants'
import { cn } from '@/lib/cn'
import './UploadZone.css'

export function UploadZone({ projectId }) {
  const { upload, reset, status, progress, file, errorMessage } = useUpload(projectId)
  const isActive = ['uploading', 'transcribing'].includes(status)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) upload(accepted[0])
  }, [upload])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept:   ACCEPTED_VIDEO_TYPES,
    maxSize:  MAX_UPLOAD_SIZE_BYTES,
    maxFiles: 1,
    disabled: isActive,
    noClick:  isActive,
    noDrag:   isActive,
  })

  const rejectionError = fileRejections[0]?.errors[0]?.message ?? null

  if (isActive || (status === 'error' && file)) {
    return (
      <div className="upload-page">
        <UploadProgress file={file} progress={progress} status={status} errorMessage={errorMessage} />
        {status === 'error' && (
          <Button variant="ghost" onClick={reset} size="sm">
            <RotateCcw width={13} height={13} />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="upload-page">

      <div className="upload-header">
        <div className="upload-icon-wrap">
          <Film width={26} height={26} />
        </div>
        <h2 className="upload-title">Upload your video</h2>
        <p className="upload-subtitle">MP4, MOV, AVI, MKV or WebM · Max 500 MB</p>
      </div>

      <div
        {...getRootProps()}
        className={cn('upload-dropzone', isDragActive && 'drag-active')}
      >
        <input {...getInputProps()} />

        <div className={cn('upload-dropzone-icon')}>
          <UploadCloud width={32} height={32} />
        </div>

        <div className="upload-dropzone-cta">
          <p className="upload-dropzone-main">
            {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="upload-dropzone-sub">or click to browse files</p>
        </div>
      </div>

      {(rejectionError || errorMessage) && (
        <div className="upload-error">
          <AlertCircle width={15} height={15} style={{ flexShrink: 0 }} />
          {rejectionError ?? errorMessage}
        </div>
      )}
    </div>
  )
}
