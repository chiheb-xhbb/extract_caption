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
import './CaptionItem.css'

export function CaptionList({ projectId }) {
  const { captions, isLoading, isError, deleteCaption, isDeleting } = useCaptions(projectId)
  const { activeCaption } = useCaptionSync(captions)
  const { editCaption }   = useEditCaption(projectId)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch]         = useState('')

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
      <div className="caption-list">
        {Array.from({ length: 12 }).map((_, i) => (
          <CaptionRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="caption-list" style={{ alignItems:'center', justifyContent:'center' }}>
        <EmptyState
          title="Failed to load captions"
          description="Check your connection and try refreshing."
        />
      </div>
    )
  }

  if (captions.length === 0) {
    return (
      <div className="caption-list" style={{ alignItems:'center', justifyContent:'center' }}>
        <EmptyState
          icon={<FileText width={22} height={22} />}
          title="No captions yet"
          description="Transcribe the video to generate captions."
        />
      </div>
    )
  }

  return (
    <div className="caption-list">
      {captions.length > 4 && (
        <div className="caption-search-bar">
          <Input
            placeholder="Search captions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search width={12} height={12} />}
          />
        </div>
      )}

      <div className="caption-scroll">
        {filtered.length === 0 ? (
          <p className="caption-empty">No captions match "{search}"</p>
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
    </div>
  )
}
