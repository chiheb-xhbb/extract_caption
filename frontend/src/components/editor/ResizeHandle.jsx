import { memo } from 'react'

/**
 * @param {{
 *   direction: 'horizontal' | 'vertical',
 *   onResize: (delta: number) => void
 * }} props
 */
export const ResizeHandle = memo(function ResizeHandle({ direction, onResize }) {
  const handleMouseDown = (e) => {
    e.preventDefault()
    
    // Save start position
    const startX = e.clientX
    const startY = e.clientY
    
    // Create iframe shield to prevent iframes capturing mousemove
    // Not strictly needed here but good practice for complicated drag layouts
    
    const onMove = (ev) => {
      onResize(direction === 'horizontal' ? ev.clientX - startX : ev.clientY - startY)
    }
    
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = 'default'
    }
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (direction === 'horizontal') {
    return (
      <div 
        className="w-1 cursor-col-resize hover:bg-[var(--color-primary)] active:bg-[var(--color-primary)] transition-colors z-10 shrink-0"
        onMouseDown={handleMouseDown}
      />
    )
  }

  return (
    <div 
      className="h-1 cursor-row-resize hover:bg-[var(--color-primary)] active:bg-[var(--color-primary)] transition-colors z-10 shrink-0"
      onMouseDown={handleMouseDown}
    />
  )
})
