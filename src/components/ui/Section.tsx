import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

// Mobile-first vertical spacing. Phones get tighter rhythms (12 = 48px) so
// the page doesn't feel airy and slow to scroll. Bump up at sm + lg.
const spacingMap = {
  sm: 'py-12 sm:py-16 lg:py-20',
  md: 'py-14 sm:py-20 lg:py-28',
  lg: 'py-16 sm:py-24 lg:py-36',
}

export function Section({ id, children, className, spacing = 'md' }: SectionProps) {
  return (
    <section id={id} className={cn('relative', spacingMap[spacing], className)}>
      {children}
    </section>
  )
}
