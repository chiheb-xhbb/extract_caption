import { cn } from '@/lib/cn'

/**
 * Subtitle overlay rendered on top of the video.
 * Styled with drop-shadow and semi-transparent background for legibility.
 * @param {{ caption: import('@/types/caption').Caption|null }} props
 */
export function SubtitleOverlay({ caption }) {
  if (!caption?.text) return null

  return (
    <div
      className="absolute inset-x-0 bottom-16 flex items-end justify-center px-8 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <div
        className="max-w-[80%] text-center leading-relaxed animate-fade-in"
        style={{
          background: 'rgba(0,0,0,0.65)',
          color:      '#ffffff',
          fontSize:   '1rem',
          fontWeight: 600,
          padding:    '6px 16px',
          borderRadius: 8,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(2px)',
          letterSpacing: '0.01em',
        }}
      >
        {caption.text}
      </div>
    </div>
  )
}
