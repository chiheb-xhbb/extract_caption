import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Film, Home } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useCaptions } from '@/hooks/useCaptions'
import { UploadZone } from '@/components/video/UploadZone'
import { EditorLayout } from '@/components/editor/EditorLayout'
import GlobalSpinner from '@/components/common/GlobalSpinner'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { ExportModal } from '@/components/editor/ExportModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/routes'

export default function EditorPage() {
  const { id } = useParams()
  const { project, isLoading: isProjectLoading, isError: isProjectError } = useProject(id)
  const { isLoading: isCaptionsLoading, isError: isCaptionsError } = useCaptions(id)

  const [exportOpen, setExportOpen] = useState(false)

  if (isProjectLoading || isCaptionsLoading) {
    return <GlobalSpinner />
  }

  if (isProjectError || isCaptionsError || !project) {
    return (
      <div className="flex items-center justify-center h-screen animate-fade-in" style={{ background: 'var(--color-bg-base)' }}>
        <EmptyState
          icon={<Film className="w-8 h-8" />}
          title="Data Loading Failed"
          description="The project or its captions could not be loaded. Please verify your connection."
          action={
            <Button as={Link} to={ROUTES.dashboard} size="md">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          }
        />
      </div>
    )
  }

  // If no video URL, we show the upload zone
  if (!project.video_url) {
    return <UploadZone projectId={project.id} />
  }

  // Otherwise show the full editor within a safety boundary inside the page
  return (
    <ErrorBoundary>
      <div className="animate-fade-in">
        <EditorLayout
          project={project}
          onExport={() => setExportOpen(true)}
        />

        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          projectId={project.id}
        />
      </div>
    </ErrorBoundary>
  )
}
