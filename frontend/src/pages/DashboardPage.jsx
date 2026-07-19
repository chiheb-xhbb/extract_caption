import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { useProjects } from '@/hooks/useProjects'
import { APP_NAME, QUERY_KEYS } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import './Dashboard.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate]           = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [search, setSearch]                   = useState('')

  const {
    projects, isLoading, isError,
    createProject, isCreating,
    deleteProject, isDeleting, deletingId,
  } = useProjects()

  const pendingDeleteProject = projects.find((p) => p.id === pendingDeleteId)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, search])

  const handleCreate = useCallback(async (formData) => {
    const newProject = await createProject(formData)
    if (newProject?.id) navigate(ROUTES.editor(newProject.id))
    return newProject
  }, [createProject, navigate])

  const handleDeleteRequest = useCallback((id) => setPendingDeleteId(id), [])

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return
    deleteProject(pendingDeleteId)
    setPendingDeleteId(null)
  }, [pendingDeleteId, deleteProject])

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1 className="dashboard-title">Projects</h1>
          <p className="dashboard-subtitle">
            {isLoading
              ? 'Loading…'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="dashboard-actions">
          {projects.length > 0 && (
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search width={13} height={13} />}
              containerClassName="w-52"
            />
          )}
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus width={14} height={14} />
            New Project
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && !isLoading && (
        <div className="dashboard-error">
          <AlertCircle className="dashboard-error-icon" width={15} height={15} />
          Failed to load projects. Check your connection and try again.
        </div>
      )}

      {/* Grid / empty state */}
      {!isError && (
        <>
          {!isLoading && filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[40vh]">
              <EmptyState
                icon={<FolderOpen width={26} height={26} />}
                title={search ? 'No matching projects' : 'No projects yet'}
                description={
                  search
                    ? `No projects matching "${search}".`
                    : `Create your first ${APP_NAME} project to get started.`
                }
                action={
                  !search && (
                    <Button onClick={() => setShowCreate(true)} size="sm">
                      <Plus width={14} height={14} />
                      New Project
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ProjectGrid
              projects={filtered}
              isLoading={isLoading}
              onDelete={handleDeleteRequest}
              deletingId={deletingId}
            />
          )}
        </>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        isLoading={isCreating}
      />

      <DeleteProjectDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        projectName={pendingDeleteProject?.name ?? ''}
      />
    </div>
  )
}
