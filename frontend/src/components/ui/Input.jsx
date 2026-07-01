import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * @param {{
 *   label?: string,
 *   error?: string,
 *   helper?: string,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   containerClassName?: string,
 * } & React.InputHTMLAttributes<HTMLInputElement>} props
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 rounded-lg border text-sm outline-none transition-all duration-[var(--duration-fast)]',
            'placeholder:text-[var(--color-text-disabled)]',
            'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-muted)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-muted)]'
              : 'border-[var(--color-border)]',
            leftIcon  && 'pl-9',
            rightIcon && 'pr-9',
            !leftIcon  && 'pl-3',
            !rightIcon && 'pr-3',
            className,
          )}
          style={{
            background: 'var(--color-bg-overlay)',
            color: 'var(--color-text-primary)',
          }}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helper) && (
        <p
          className="text-xs"
          style={{ color: error ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
        >
          {error ?? helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export { Input }
