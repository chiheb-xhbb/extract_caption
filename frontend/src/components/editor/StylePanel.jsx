import { useState } from 'react'
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const FONT_OPTIONS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact']
const FONT_SIZES   = [16, 20, 24, 28, 32, 40]
const PRESETS = [
  { label: 'Bold', fontWeight: 700, fontStyle: 'normal',  color: '#ffffff', bg: 'transparent' },
  { label: 'Karaoke', fontWeight: 700, fontStyle: 'normal', color: '#facc15', bg: 'rgba(0,0,0,0.6)' },
  { label: 'Classic', fontWeight: 400, fontStyle: 'normal', color: '#ffffff', bg: 'rgba(0,0,0,0.5)' },
  { label: 'Italic', fontWeight: 400, fontStyle: 'italic',  color: '#e2e8f0', bg: 'transparent' },
]

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </p>
  )
}

function ToggleButton({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center h-8 px-2.5 rounded-lg border transition-all duration-[var(--duration-fast)] text-sm font-medium"
      style={{
        background:  active ? 'var(--color-primary-muted)' : 'transparent',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        color:       active ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

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
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--color-bg-base)' }}>
      <div className="p-4 space-y-5">

        {/* Presets */}
        <div>
          <SectionLabel>Preset</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className="h-9 rounded-lg border text-sm font-medium transition-all duration-[var(--duration-fast)]"
                style={{
                  borderColor: preset === p.label ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  preset === p.label ? 'var(--color-primary-muted)' : 'transparent',
                  color:       preset === p.label ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <SectionLabel>Typography</SectionLabel>
          <div className="space-y-2">
            {/* Font family */}
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border text-sm outline-none transition-all"
              style={{
                background:  'var(--color-bg-overlay)',
                borderColor: 'var(--color-border)',
                color:       'var(--color-text-primary)',
              }}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Size + style */}
            <div className="flex gap-2 items-center">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border text-sm outline-none transition-all flex-1"
                style={{
                  background:  'var(--color-bg-overlay)',
                  borderColor: 'var(--color-border)',
                  color:       'var(--color-text-primary)',
                }}
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
              <ToggleButton active={bold} onClick={() => setBold((v) => !v)} title="Bold">
                <Bold className="w-3.5 h-3.5" />
              </ToggleButton>
              <ToggleButton active={italic} onClick={() => setItalic((v) => !v)} title="Italic">
                <Italic className="w-3.5 h-3.5" />
              </ToggleButton>
            </div>

            {/* Alignment */}
            <div className="flex gap-2">
              {[
                { v: 'left',   Icon: AlignLeft   },
                { v: 'center', Icon: AlignCenter  },
                { v: 'right',  Icon: AlignRight   },
              ].map(({ v, Icon }) => (
                <ToggleButton key={v} active={align === v} onClick={() => setAlign(v)} title={`Align ${v}`}>
                  <Icon className="w-3.5 h-3.5" />
                </ToggleButton>
              ))}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div>
          <SectionLabel>Colors</SectionLabel>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Text color</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{textColor}</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', background: 'none', padding: 2 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(Number(e.target.value))}
                  className="w-20"
                  aria-label="Background opacity"
                />
                <span className="text-xs tabular-nums w-8" style={{ color: 'var(--color-text-muted)' }}>
                  {bgOpacity}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <SectionLabel>Preview</SectionLabel>
          <div
            className="relative h-20 rounded-xl flex items-end justify-center p-3 overflow-hidden"
            style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="px-4 py-1.5 rounded max-w-full text-center"
              style={{
                fontFamily: font,
                fontSize:   `${Math.round(fontSize * 0.6)}px`,
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
