import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'soft' | 'glass' | 'outline' | 'editorial'
  as?: 'div' | 'article'
  interactive?: boolean
}

const variants = {
  default:   'bg-paper shadow-card border border-cream-200/60 ring-inset-warm',
  soft:      'bg-cream-100/60 border border-cream-200',
  glass:     'card-glass shadow-soft',
  outline:   'bg-transparent border border-cream-300',
  editorial: 'bg-paper shadow-soft border border-cream-200/50 ring-inset-warm',
}

export function Card({
  children,
  className,
  variant = 'default',
  as: As = 'div',
  interactive = false,
}: CardProps) {
  return (
    <As
      className={cn(
        'rounded-2xl',
        variants[variant],
        interactive && 'lift-card cursor-pointer',
        className,
      )}
    >
      {children}
    </As>
  )
}
