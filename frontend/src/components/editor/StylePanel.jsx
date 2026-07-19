import { useState } from 'react'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import './StylePanel.css'

const FONT_OPTIONS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact']
const FONT_SIZES   = [16, 20, 24, 28, 32, 40]
const PRESETS = [
  { label: 'Bold',    fontWeight: 700, fontStyle: 'normal', color: '#ffffff', bg: 'transparent' },
  { label: 'Karaoke', fontWeight: 700, fontStyle: 'normal', color: '#facc15', bg: 'rgba(0,0,0,0.6)' },
  { label: 'Classic', fontWeight: 400, fontStyle: 'normal', color: '#ffffff', bg: 'rgba(0,0,0,0.5)' },
  { label: 'Italic',  fontWeight: 400, fontStyle: 'italic', color: '#e2e8f0', bg: 'transparent' },
]

export function StylePanel() {
  const [preset,    setPreset]    = useState('Classic')
  const [font,      setFont]      = useState('Inter')
  const [fontSize,  setFontSize]  = useState(24)
  const [bold,      setBold]      = useState(false)
  const [italic,    setItalic]    = useState(false)
  const [align,     setAlign]     = useState('center')
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor,   setBgColor]   = useState('#000000')
  const [bgOpacity, setBgOpacity] = useState(0)

  const handlePreset = (p) => {
    setPreset(p.label)
    setBold(p.fontWeight >= 700)
    setItalic(p.fontStyle === 'italic')
    setTextColor(p.color)
  }

  return (
    <div className="style-panel">
      <div className="style-panel-content">

        {/* Presets */}
        <div className="style-section">
          <p className="style-section-label">Preset</p>
          <div className="style-presets-grid">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className={cn('style-preset-btn', preset === p.label && 'active')}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="style-section">
          <p className="style-section-label">Typography</p>

          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="style-select"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <div className="style-toggle-row">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="style-select"
              style={{ flex: 1 }}
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>

            <button
              onClick={() => setBold((v) => !v)}
              className={cn('style-toggle-btn', bold && 'active')}
              title="Bold"
              aria-pressed={bold}
            >
              <Bold width={13} height={13} />
            </button>
            <button
              onClick={() => setItalic((v) => !v)}
              className={cn('style-toggle-btn', italic && 'active')}
              title="Italic"
              aria-pressed={italic}
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
                onClick={() => setAlign(v)}
                className={cn('style-toggle-btn', align === v && 'active')}
                title={`Align ${v}`}
                aria-pressed={align === v}
              >
                <Icon width={13} height={13} />
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="style-section">
          <p className="style-section-label">Colors</p>

          <div className="style-color-row">
            <span className="style-color-label">Text</span>
            <div className="style-color-right">
              <span className="style-color-hex">{textColor}</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="style-color-input"
                aria-label="Text color"
              />
            </div>
          </div>

          <div className="style-color-row">
            <span className="style-color-label">Background</span>
            <div className="style-color-right">
              <input
                type="range"
                min={0} max={100}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                style={{ width: 72 }}
                aria-label="Background opacity"
              />
              <span className="style-color-hex" style={{ minWidth: 32 }}>{bgOpacity}%</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="style-section">
          <p className="style-section-label">Preview</p>
          <div className="style-preview">
            <div
              className="style-preview-text"
              style={{
                fontFamily: font,
                fontSize:   `${Math.round(fontSize * 0.58)}px`,
                fontWeight: bold ? 700 : 400,
                fontStyle:  italic ? 'italic' : 'normal',
                textAlign:  align,
                color:      textColor,
                background: bgOpacity > 0
                  ? `${bgColor}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, '0')}`
                  : 'transparent',
              }}
            >
              Sample caption text
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
