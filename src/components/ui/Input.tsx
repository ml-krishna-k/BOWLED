import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, trailing, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? Math.random().toString(36).slice(2, 8)
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-ink-700"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border bg-paper px-4',
          'transition-colors focus-within:border-saffron-400 focus-within:ring-2 focus-within:ring-saffron-200',
          error ? 'border-spice-500' : 'border-cream-300',
        )}
      >
        {leading && <span className="text-ink-500 shrink-0">{leading}</span>}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-12 w-full bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 outline-none',
            className,
          )}
          {...rest}
        />
        {trailing && <span className="text-ink-500 shrink-0">{trailing}</span>}
      </div>
      {(hint || error) && (
        <p
          className={cn(
            'mt-1.5 text-xs',
            error ? 'text-spice-500' : 'text-ink-500',
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
})
