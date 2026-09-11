import { useCallback, useMemo } from 'react'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useEditorStore } from '@/store/editorStore'
import { useCaptionStyleStore } from '@/store/captionStyleStore'
import { useCaptions } from '@/hooks/useCaptions'
import {
  DEFAULT_CAPTION_STYLE,
  FONT_OPTIONS,
  FONT_SIZES,
  STYLE_PRESETS,
} from '@/config/captionStyle'
import './StylePanel.css'

export function StylePanel({ projectId }) {
  const selectedId   = useEditorStore((s) => s.selectedCaptionId)
  const { captions } = useCaptions(projectId)

  const getStyle   = useCaptionStyleStore((s) => s.getStyle)
  const patchStyle = useCaptionStyleStore((s) => s.patchStyle)
  const setStyle   = useCaptionStyleStore((s) => s.setStyle)

  const record = useEditorStore((s) => s.record)

  const caption = useMemo(
    () => captions.find((c) => c.id === selectedId) ?? null,
    [captions, selectedId]
  )

  const style = useMemo(
    () => (selectedId ? getStyle(selectedId) : DEFAULT_CAPTION_STYLE),
    [selectedId, getStyle]
  )

  const patch = useCallback(
    (updates) => {
      if (!selectedId) return
      const before = { ...style }
      const after  = { ...style, ...updates }
      patchStyle(selectedId, updates)
      record(selectedId, { style: before }, { style: after })
    },
    [selectedId, style, patchStyle, record]
  )

  const applyPreset = useCallback(
    (preset) => {
      if (!selectedId) return
      const before = { ...style }
      const after  = { ...style, ...preset.style }
      setStyle(selectedId, after)
      record(selectedId, { style: before }, { style: after })
    },
    [selectedId, style, setStyle, record]
  )

  const bgHex = useMemo(() => {
    const opacity = Math.round((style.backgroundOpacity / 100) * 255)
    return style.backgroundOpacity > 0
      ? `${style.backgroundColor}${opacity.toString(16).padStart(2, '0')}`
      : 'transparent'
  }, [style.backgroundColor, style.backgroundOpacity])

  if (!selectedId || !caption) {
    return (
      <div className="style-panel">
        <div className="style-panel-empty">
          <Type width={18} height={18} />
          <span>Select a caption to edit its style</span>
        </div>
      </div>
    )
  }

  return (
    <div className="style-panel">
      <div className="style-panel-content">

        <div className="style-section">
          <p className="style-section-label">Preset</p>
          <div className="style-presets-grid">
            {STYLE_PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)} className="style-preset-btn">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="style-section">
          <p className="style-section-label">Typography</p>

          <select
            value={style.fontFamily}
            onChange={(e) => patch({ fontFamily: e.target.value })}
            className="style-select"
            aria-label="Font"
          >
            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <div className="style-toggle-row">
            <select
              value={style.fontSize}
              onChange={(e) => patch({ fontSize: Number(e.target.value) })}
              className="style-select"
              style={{ flex: 1 }}
              aria-label="Font size"
            >
              {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>

            <button
              onClick={() => patch({ fontWeight: style.fontWeight >= 700 ? 400 : 700 })}
              className={cn('style-toggle-btn', style.fontWeight >= 700 && 'active')}
              aria-pressed={style.fontWeight >= 700}
              aria-label="Bold" title="Bold"
            >
              <Bold width={13} height={13} />
            </button>

            <button
              onClick={() => patch({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={cn('style-toggle-btn', style.fontStyle === 'italic' && 'active')}
              aria-pressed={style.fontStyle === 'italic'}
              aria-label="Italic" title="Italic"
            >
              <Italic width={13} height={13} />
            </button>
          </div>

          <div className="style-toggle-row">
            {[
              { v: 'left',   Icon: AlignLeft   },
              { v: 'center', Icon: AlignCenter  },
              { v: 'right',  Icon: AlignRight   },
            ].map(({ v, Icon }) => (
              <button
                key={v}
                onClick={() => patch({ textAlign: v })}
                className={cn('style-toggle-btn', style.textAlign === v && 'active')}
                aria-pressed={style.textAlign === v}
                aria-label={`Align ${v}`} title={`Align ${v}`}
              >
                <Icon width={13} height={13} />
              </button>
            ))}
          </div>
        </div>

        <div className="style-section">
          <p className="style-section-label">Colors</p>

          <div className="style-color-row">
            <span className="style-color-label">Text</span>
            <div className="style-color-right">
              <span className="style-color-hex">{style.color}</span>
              <input
                type="color"
                value={style.color}
                onChange={(e) => patch({ color: e.target.value })}
                className="style-color-input"
                aria-label="Text color"
              />
            </div>
          </div>

          <div className="style-color-row">
            <span className="style-color-label">Background</span>
            <div className="style-color-right">
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) => patch({ backgroundColor: e.target.value })}
                className="style-color-input"
                aria-label="Background color"
              />
              <input
                type="range"
                min={0} max={100}
                value={style.backgroundOpacity}
                onChange={(e) => patch({ backgroundOpacity: Number(e.target.value) })}
                style={{ width: 64 }}
                aria-label="Background opacity"
              />
              <span className="style-color-hex" style={{ minWidth: 34 }}>
                {style.backgroundOpacity}%
              </span>
            </div>
          </div>
        </div>

        <div className="style-section">
          <p className="style-section-label">Preview</p>
          <div className="style-preview">
            <div
              className="style-preview-text"
              style={{
                fontFamily: style.fontFamily,
                fontSize:   `${Math.round(style.fontSize * 0.52)}px`,
                fontWeight: style.fontWeight,
                fontStyle:  style.fontStyle,
                textAlign:  style.textAlign,
                color:      style.color,
                background: bgHex,
              }}
            >
              {caption.text || 'Caption preview'}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
