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
import './EditorLayout.css'

/**
 * @param {{
 *   project: import('@/types/project').Project,
 *   onExport: () => void
 * }} props
 */
export function EditorLayout({ project, onExport }) {
  const panelSizes   = useUIStore((s) => s.panelSizes)
  const setPanelSize = useUIStore((s) => s.setPanelSize)

  const { captions } = useCaptions(project.id)
  const { activeCaption } = useCaptionSync(captions)
  const videoUrl = resolveVideoUrl(project.video_url)

  return (
    <div className="editor-root">
      <EditorTopbar project={project} onExport={onExport} />

      {/* Main 3-panel row */}
      <div className="editor-main">

        {/* Left — Captions */}
        <div
          className="editor-panel-left"
          style={{ width: `${panelSizes.leftPanel}px` }}
        >
          <div className="editor-panel-header">
            <div className="editor-panel-title">
              <MessageSquare width={12} height={12} />
              Captions
            </div>
            {captions.length > 0 && (
              <span className="editor-panel-count">{captions.length}</span>
            )}
          </div>
          <CaptionList projectId={project.id} />
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(delta) =>
            setPanelSize('leftPanel', Math.max(250, Math.min(600, panelSizes.leftPanel + delta)))
          }
        />

        {/* Center — Video */}
        <div className="editor-panel-center">
          <VideoPlayer
            key={videoUrl}
            src={videoUrl}
            activeCaption={activeCaption}
            className="w-full h-full"
          />
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(delta) =>
            setPanelSize('rightPanel', Math.max(250, Math.min(500, panelSizes.rightPanel - delta)))
          }
        />

        {/* Right — Style */}
        <div
          className="editor-panel-right"
          style={{ width: `${panelSizes.rightPanel}px` }}
        >
          <div className="editor-panel-header">
            <div className="editor-panel-title">
              <Palette width={12} height={12} />
              Style
            </div>
          </div>
          <StylePanel />
        </div>
      </div>

      <ResizeHandle
        direction="vertical"
        onResize={(delta) =>
          setPanelSize('bottomPanel', Math.max(180, Math.min(600, panelSizes.bottomPanel - delta)))
        }
      />

      {/* Bottom — Timeline */}
      <div
        className="editor-panel-bottom"
        style={{ height: `${panelSizes.bottomPanel}px` }}
      >
        <Timeline projectId={project.id} />
      </div>
    </div>
  )
}
