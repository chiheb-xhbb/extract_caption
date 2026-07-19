import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import './Input.css'

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
    <div className={cn('input-root', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        {leftIcon && (
          <span className="input-icon-left">{leftIcon}</span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'input-field',
            leftIcon  && 'has-left',
            rightIcon && 'has-right',
            error && 'error',
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <span className="input-icon-right">{rightIcon}</span>
        )}
      </div>

      {(error || helper) && (
        <p className={cn('input-helper', error && 'error')}>
          {error ?? helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export { Input }
