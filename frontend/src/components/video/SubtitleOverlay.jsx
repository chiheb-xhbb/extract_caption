import { useCaptionStyleStore } from '@/store/captionStyleStore'

export function SubtitleOverlay({ caption }) {
  const getStyle = useCaptionStyleStore((s) => s.getStyle)

  if (!caption?.text) return null

  const s = getStyle(caption.id)

  const bgAlpha = Math.round((s.backgroundOpacity / 100) * 255)
    .toString(16)
    .padStart(2, '0')
  const background = s.backgroundOpacity > 0
    ? `${s.backgroundColor}${bgAlpha}`
    : 'transparent'

  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' }

  return (
    <div
      className="subtitle-overlay"
      style={{ justifyContent: alignMap[s.textAlign] ?? 'center' }}
    >
      <span
        className="subtitle-text"
        style={{
          fontFamily: s.fontFamily,
          fontSize:   `${s.fontSize}px`,
          fontWeight: s.fontWeight,
          fontStyle:  s.fontStyle,
          color:      s.color,
          background,
          textAlign:  s.textAlign,
        }}
      >
        {caption.text}
      </span>
    </div>
  )
}
