import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'saffron' | 'leaf' | 'cream' | 'ink' | 'paper'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

const tones: Record<Tone, string> = {
  saffron: 'bg-saffron-100 text-saffron-700',
  leaf:    'bg-leaf-100 text-leaf-700',
  cream:   'bg-cream-100 text-ink-700',
  ink:     'bg-ink-900 text-cream-50',
  paper:   'bg-paper text-ink-700 border border-cream-200',
}

export function Badge({ children, tone = 'cream', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
