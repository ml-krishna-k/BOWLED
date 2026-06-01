import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function AppContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  // Mobile-first: tight horizontal gutter (16px) on phones, vertical 4
  // (16px). Avoids the cramped look of py-5 on a tall phone viewport.
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
