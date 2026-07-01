import { useState, useMemo } from 'react'
import { FileText, Search } from 'lucide-react'
import { useCaptions } from '@/hooks/useCaptions'
import { useCaptionSync } from '@/hooks/useCaptionSync'
import { useEditCaption } from '@/hooks/useEditCaption'
import { CaptionItem } from '@/components/captions/CaptionItem'
import { DeleteCaptionDialog } from '@/components/captions/DeleteCaptionDialog'
import { CaptionRowSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'

/**
 * @param {{ projectId: number|string }} props
 */
export function CaptionList({ projectId }) {
  const { captions, isLoading, isError, deleteCaption, isDeleting } = useCaptions(projectId)
  const { activeCaption } = useCaptionSync(captions)
  const { editCaption } = useEditCaption(projectId)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return captions
    return captions.filter((c) => c.text.toLowerCase().includes(q))
  }, [captions, search])

  const handleEdit = (captionId, payload, previousText) => {
    editCaption({ captionId, payload, previousText })
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteCaption(deletingId)
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <CaptionRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          title="Failed to load captions"
          description="Check your connection and try refreshing."
        />
      </div>
    )
  }

  if (captions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No captions yet"
          description="Transcribe the video to generate captions."
        />
      </div>
    )
  }

  return (
    <>
      {/* Search */}
      {captions.length > 4 && (
        <div className="px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <Input
            placeholder="Search captions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3 h-3" />}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No captions match "{search}"
          </div>
        ) : (
          filtered.map((caption, index) => (
            <CaptionItem
              key={caption.id}
              caption={caption}
              index={index}
              isActive={activeCaption?.id === caption.id}
              onDeleteRequest={setDeletingId}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      <DeleteCaptionDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  )
}
