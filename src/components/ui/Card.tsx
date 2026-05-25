import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'soft' | 'glass' | 'outline'
  as?: 'div' | 'article'
}

const variants = {
  default: 'bg-paper shadow-card border border-cream-200/60',
  soft:    'bg-cream-100/60 border border-cream-200',
  glass:   'card-glass shadow-soft',
  outline: 'bg-transparent border border-cream-300',
}

export function Card({ children, className, variant = 'default', as: As = 'div' }: CardProps) {
  return (
    <As className={cn('rounded-2xl', variants[variant], className)}>
      {children}
    </As>
  )
}
