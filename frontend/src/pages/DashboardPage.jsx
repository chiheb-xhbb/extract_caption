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

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate]           = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [search, setSearch]                   = useState('')

  const {
    projects,
    isLoading,
    isError,
    createProject,
    isCreating,
    deleteProject,
    isDeleting,
    deletingId,
  } = useProjects()

  const pendingDeleteProject = projects.find((p) => p.id === pendingDeleteId)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, search])

  const handleCreate = useCallback(async (formData) => {
    const newProject = await createProject(formData)
    if (newProject?.id) {
      navigate(ROUTES.editor(newProject.id))
    }
    return newProject
  }, [createProject, navigate])

  const handleDeleteRequest = useCallback((id) => setPendingDeleteId(id), [])

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return
    deleteProject(pendingDeleteId)
    setPendingDeleteId(null)
  }, [pendingDeleteId, deleteProject])

  return (
    <div className="flex flex-col gap-8 p-8 max-w-screen-2xl mx-auto w-full animate-fade-in">

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isLoading
              ? 'Loading…'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              containerClassName="w-52"
            />
          )}
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && !isLoading && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-slide-up"
          style={{
            background:  'var(--color-danger-muted)',
            borderColor: 'rgba(239,68,68,0.2)',
            color:       'var(--color-danger)',
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to load projects. Check your connection and try again.
        </div>
      )}

      {/* Grid / empty state */}
      {!isError && (
        <>
          {!isLoading && filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[40vh]">
              <EmptyState
                icon={<FolderOpen className="w-7 h-7" />}
                title={search ? 'No matching projects' : 'No projects yet'}
                description={
                  search
                    ? `No projects matching "${search}".`
                    : `Create your first ${APP_NAME} project to get started.`
                }
                action={
                  !search && (
                    <Button onClick={() => setShowCreate(true)} size="sm">
                      <Plus className="w-4 h-4" />
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
