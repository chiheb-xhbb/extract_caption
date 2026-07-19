import { APP_NAME } from '@/config/constants'
import './Settings.css'

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

export default function SettingsPage() {
  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Configure application preferences.</p>
      </div>

      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title} className="settings-section">
          <p className="settings-section-label">{section.title}</p>

          <div className="settings-group">
            {section.items.map((item) => (
              <div key={item.label} className="settings-row">
                <label className="settings-row-label">{item.label}</label>

                {item.readonly ? (
                  <span className="settings-row-value">{item.value}</span>
                ) : item.type === 'select' ? (
                  <select defaultValue={item.default} className="settings-row-select">
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
