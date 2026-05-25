import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function AppContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 py-6 lg:py-10', className)}>
      {children}
    </div>
  )
}
