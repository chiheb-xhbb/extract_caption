import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const variants = {
  primary:   'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] text-white shadow-sm',
  secondary: 'bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
  ghost:     'hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  danger:    'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-white shadow-sm',
  outline:   'border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.03]',
}

const sizes = {
  xs:   'h-6 px-2 text-xs gap-1 rounded-md',
  sm:   'h-7 px-3 text-xs gap-1.5 rounded-md',
  md:   'h-9 px-4 text-sm gap-2 rounded-lg',
  lg:   'h-11 px-5 text-sm gap-2.5 rounded-lg',
  icon: 'h-9 w-9 p-0 rounded-lg',
  'icon-sm': 'h-7 w-7 p-0 rounded-md',
}

/**
 * @param {{
 *   variant?: keyof variants,
 *   size?: keyof sizes,
 *   loading?: boolean,
 *   children: React.ReactNode
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
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
        'inline-flex items-center justify-center font-medium select-none',
        'transition-all duration-[var(--duration-fast)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.97]',
        variants[variant] ?? variants.primary,
        sizes[size]   ?? sizes.md,
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
