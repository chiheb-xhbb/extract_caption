import { APP_NAME } from '@/config/constants'

const SETTINGS_SECTIONS = [
  {
    title: 'Application',
    items: [
      { label: 'App name', value: APP_NAME, readonly: true },
      { label: 'Default export format', type: 'select', options: ['SRT', 'VTT', 'MP4'], default: 'SRT' },
    ],
  },
  {
    title: 'Transcription',
    items: [
      { label: 'Default language', type: 'select', options: ['Auto-detect', 'English', 'French', 'Spanish', 'Arabic'], default: 'Auto-detect' },
      { label: 'AI model', type: 'select', options: ['Whisper Small', 'Whisper Base', 'Whisper Large'], default: 'Whisper Small' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'Version', value: import.meta.env.VITE_APP_VERSION ?? '1.0.0', readonly: true },
      { label: 'Backend API', value: import.meta.env.VITE_API_BASE_URL ?? 'Not configured', readonly: true },
    ],
  },
]

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider px-1 mb-3" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </p>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Configure application preferences.
        </p>
      </div>

      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title}>
          <SectionLabel>{section.title}</SectionLabel>
          <div
            className="rounded-2xl border divide-y overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}
          >
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-3 gap-4">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.label}
                </label>

                {item.readonly ? (
                  <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {item.value}
                  </span>
                ) : item.type === 'select' ? (
                  <select
                    defaultValue={item.default}
                    className="h-8 px-2 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      background:  'var(--color-bg-overlay)',
                      borderColor: 'var(--color-border)',
                      color:       'var(--color-text-primary)',
                    }}
                  >
                    {item.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
