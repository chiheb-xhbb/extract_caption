import { useCaptions } from '@/hooks/useCaptions'
import { useUIStore } from '@/store/uiStore'
import { ResizeHandle } from '@/components/editor/ResizeHandle'
import { EditorTopbar } from '@/components/editor/EditorTopbar'
import { CaptionList } from '@/components/captions/CaptionList'
import { StylePanel } from '@/components/editor/StylePanel'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { Timeline } from '@/components/timeline/Timeline'
import { useCaptionSync } from '@/hooks/useCaptionSync'
import { MessageSquare, Palette } from 'lucide-react'
import { resolveVideoUrl } from '@/config/constants'

/**
 * @param {{
 *   project: import('@/types/project').Project,
 *   onExport: () => void
 * }} props
 */
export function EditorLayout({ project, onExport }) {
  const panelSizes = useUIStore((s) => s.panelSizes)
  const setPanelSize = useUIStore((s) => s.setPanelSize)

  const { captions } = useCaptions(project.id)
  const { activeCaption } = useCaptionSync(captions)
  const videoUrl = resolveVideoUrl(project.video_url)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
      <EditorTopbar project={project} onExport={onExport} />

      {/* Main Content Area (above timeline) */}
      <div className="flex flex-1 min-h-0">

        {/* Left Panel — Captions */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: `${panelSizes.leftPanel}px`, background: 'var(--color-bg-elevated)', borderRight: '1px solid var(--color-border)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Captions
              </h3>
            </div>
            {captions.length > 0 && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-secondary)' }}
              >
                {captions.length}
              </span>
            )}
          </div>
          <CaptionList projectId={project.id} />
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(delta) => setPanelSize('leftPanel', Math.max(250, Math.min(600, panelSizes.leftPanel + delta)))}
        />

        {/* Center Panel — Video */}
        <div className="flex-1 min-w-0 flex flex-col bg-black relative">
          <VideoPlayer
            key={videoUrl}
            src={videoUrl}
            activeCaption={activeCaption}
            className="w-full h-full"
          />
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(delta) => setPanelSize('rightPanel', Math.max(250, Math.min(500, panelSizes.rightPanel - delta)))}
        />

        {/* Right Panel — Style */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: `${panelSizes.rightPanel}px`, borderLeft: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <Palette className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Style
            </h3>
          </div>
          <StylePanel />
        </div>
      </div>

      <ResizeHandle
        direction="vertical"
        onResize={(delta) => setPanelSize('bottomPanel', Math.max(180, Math.min(600, panelSizes.bottomPanel - delta)))}
      />

      {/* Bottom Panel — Timeline */}
      <div
        className="shrink-0 flex flex-col relative"
        style={{
          height: `${panelSizes.bottomPanel}px`,
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Timeline projectId={project.id} />
      </div>
    </div>
  )
}
