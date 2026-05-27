import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h1 className="mt-1.5 text-display text-2xl sm:text-3xl lg:text-4xl text-ink-900 break-words">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-ink-500 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="sm:shrink-0">{action}</div>}
    </div>
  )
}
