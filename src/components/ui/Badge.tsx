import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'saffron' | 'leaf' | 'cream' | 'ink' | 'paper'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
  dot?: boolean
}

const tones: Record<Tone, string> = {
  saffron: 'bg-saffron-100 text-saffron-700 ring-1 ring-saffron-200/60',
  leaf:    'bg-leaf-100 text-leaf-700 ring-1 ring-leaf-300/40',
  cream:   'bg-cream-100 text-ink-700 ring-1 ring-cream-200',
  ink:     'bg-ink-900 text-cream-50 ring-1 ring-ink-900/20',
  paper:   'bg-paper text-ink-700 ring-1 ring-cream-200',
}

const dotColor: Record<Tone, string> = {
  saffron: 'bg-saffron-500',
  leaf:    'bg-leaf-500',
  cream:   'bg-ink-700',
  ink:     'bg-saffron-300',
  paper:   'bg-saffron-500',
}

export function Badge({ children, tone = 'cream', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn('h-1.5 w-1.5 rounded-full', dotColor[tone])}
        />
      )}
      {children}
    </span>
  )
}
