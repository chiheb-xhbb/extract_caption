import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectCardSkeleton } from '@/components/ui/Skeleton'

/**
 * @param {{
 *   projects: import('@/types/project').Project[],
 *   isLoading: boolean,
 *   onDelete: (id: number) => void,
 *   deletingId?: number
 * }} props
 */
export function ProjectGrid({ projects, isLoading, onDelete, deletingId }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-slide-up">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDelete}
          isDeleting={deletingId === project.id}
        />
      ))}
    </div>
  )
}
