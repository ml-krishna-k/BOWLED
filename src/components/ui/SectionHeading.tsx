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
        'space-y-4 sm:space-y-5',
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
      {/* Mobile-first display sizes. Phones get 2rem (32px) — readable on a
          360-px-wide viewport without breaking the layout. Up at sm to 2.5rem
          and at lg to 3-4rem editorial scale. */}
      <h2
        className={cn(
          'text-display text-ink-900',
          size === 'lg'
            ? 'text-[2.25rem] sm:text-4xl lg:text-5xl xl:text-[3.75rem] leading-[1.05]'
            : 'text-[2rem] sm:text-3xl lg:text-4xl xl:text-5xl leading-[1.1]',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-ink-500 leading-relaxed',
            size === 'lg' ? 'text-base sm:text-lg lg:text-xl' : 'text-[15px] sm:text-base lg:text-lg',
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
