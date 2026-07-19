import { Film, Loader2, AlertCircle } from 'lucide-react'
import './UploadZone.css'

/**
 * @param {{ file: File|null, progress: number, status: string, errorMessage: string|null }} props
 */
export function UploadProgress({ file, progress, status, errorMessage }) {
  const isError       = status === 'error'
  const isTranscribing = status === 'transcribing'

  return (
    <div className="upload-progress-wrap animate-fade-in">

      <div className="upload-progress-icon">
        {isError
          ? <AlertCircle width={26} height={26} style={{ color: 'var(--danger)' }} />
          : isTranscribing
            ? <Loader2 width={26} height={26} className="animate-spin" />
            : <Film width={26} height={26} />}
      </div>

      <div>
        <p className="upload-progress-title">
          {isError       ? 'Upload Failed'    :
           isTranscribing ? 'Transcribing…'  :
                           'Uploading…'}
        </p>
        {file && (
          <p className="upload-progress-file">{file.name}</p>
        )}
        {isError && errorMessage && (
          <p className="upload-progress-file" style={{ color: 'var(--danger)' }}>
            {errorMessage}
          </p>
        )}
      </div>

      {!isError && (
        <>
          <div className="upload-progress-bar-wrap">
            <div
              className="upload-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="upload-progress-pct">{progress}%</p>
        </>
      )}
    </div>
  )
}
