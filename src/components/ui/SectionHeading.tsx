import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Eyebrow } from './Eyebrow'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  size?: 'md' | 'lg'
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  size = 'md',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'space-y-5',
        size === 'lg' ? 'max-w-4xl' : 'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <div className={cn(align === 'center' && 'justify-center', 'flex')}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={cn(
          'text-display text-ink-900',
          size === 'lg'
            ? 'text-4xl sm:text-5xl lg:text-[3.75rem]'
            : 'text-3xl sm:text-4xl lg:text-5xl',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-ink-500 leading-relaxed',
            size === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg',
            align === 'center' && 'mx-auto',
            'max-w-2xl',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
