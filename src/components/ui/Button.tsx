import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leading?: ReactNode
  trailing?: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-cream-50 hover:bg-spice-700 shadow-soft hover:shadow-card active:scale-[0.98]',
  secondary:
    'bg-saffron-500 text-white hover:bg-saffron-600 shadow-soft hover:shadow-glow active:scale-[0.98] ' +
    'before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none',
  ghost:
    'bg-transparent text-ink-900 hover:bg-cream-100',
  outline:
    'bg-paper text-ink-900 border border-cream-300 hover:border-saffron-400 hover:text-saffron-700 hover:shadow-soft',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leading,
  trailing,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center rounded-full font-medium overflow-hidden',
        'transition-[transform,box-shadow,background,border-color,color] duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {leading && <span className="relative">{leading}</span>}
      <span className="relative">{children}</span>
      {trailing && (
        <span className="relative transition-transform duration-300 ease-out group-hover:translate-x-0.5">
          {trailing}
        </span>
      )}
    </button>
  )
}
