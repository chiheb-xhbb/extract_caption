import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import './Button.css'

const variantClass = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  outline:   'btn-outline',
}

const sizeClass = {
  xs:       'btn-xs',
  sm:       'btn-sm',
  md:       'btn-md',
  lg:       'btn-lg',
  icon:     'btn-icon',
  'icon-sm':'btn-icon-sm',
  'icon-xs':'btn-icon-xs',
}

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'ghost'|'danger'|'outline',
 *   size?:    'xs'|'sm'|'md'|'lg'|'icon'|'icon-sm'|'icon-xs',
 *   loading?: boolean,
 *   children: React.ReactNode
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
const Button = forwardRef(({
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'btn',
        variantClass[variant] ?? variantClass.primary,
        sizeClass[size]       ?? sizeClass.md,
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export { Button }
