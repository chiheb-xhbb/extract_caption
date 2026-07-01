import { cn } from '@/lib/cn'

/**
 * Base skeleton block with shimmer animation.
 * @param {{ className?: string, style?: React.CSSProperties }} props
 */
function Skeleton({ className, style }) {
  return (
    <div
      className={cn('rounded-lg skeleton-shimmer', className)}
      style={{ minHeight: 12, ...style }}
      aria-hidden="true"
    />
  )
}

/** Skeleton row for caption list */
function CaptionRowSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex flex-col gap-2 w-14 shrink-0 pt-0.5">
        <Skeleton className="h-3 w-6" />
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-12" />
      </div>
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

/** Skeleton card for project grid */
function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
    >
      <Skeleton className="h-40 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-5 w-5 rounded-md" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, CaptionRowSkeleton, ProjectCardSkeleton }
