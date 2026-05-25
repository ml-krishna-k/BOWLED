import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingMap = {
  sm: 'py-16 sm:py-20',
  md: 'py-20 sm:py-28',
  lg: 'py-24 sm:py-32 lg:py-36',
}

export function Section({ id, children, className, spacing = 'md' }: SectionProps) {
  return (
    <section id={id} className={cn('relative', spacingMap[spacing], className)}>
      {children}
    </section>
  )
}
