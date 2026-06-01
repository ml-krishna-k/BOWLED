import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  /** Optional chapter numeral that floats to the right of the title — editorial */
  chapter?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  chapter,
}: PageHeaderProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-eyebrow">{eyebrow}</p>
              {chapter && (
                <>
                  <span aria-hidden className="h-px flex-1 max-w-[4rem] sm:max-w-[6rem] bg-cream-300" />
                  <span className="text-chapter text-xs sm:text-sm text-saffron-500 tabular-nums">
                    {chapter}
                  </span>
                </>
              )}
            </div>
          )}
          {/* Mobile-first: 1.75rem at base, scale up. Tight leading so it fits
              two lines comfortably on a phone. */}
          <h1 className="mt-2 text-display text-[1.75rem] sm:text-3xl lg:text-[2.5rem] xl:text-[2.75rem] tracking-[-0.025em] leading-[1.1] sm:leading-[1.05] text-ink-900 break-words">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-[14px] sm:text-[15px] lg:text-base text-ink-500 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="sm:shrink-0">{action}</div>
        )}
      </div>
      <div className="mt-5 sm:mt-7 hairline" />
    </div>
  )
}
