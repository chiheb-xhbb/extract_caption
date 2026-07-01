import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const sizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
}

/**
 * Inline loading spinner.
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export function Spinner({ size = 'md', className }) {
  return (
    <Loader2
      className={cn('animate-spin shrink-0', sizes[size], className)}
      style={{ color: 'var(--color-primary)' }}
    />
  )
}
