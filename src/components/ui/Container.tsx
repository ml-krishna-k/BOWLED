import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
}

export function Container({ children, className, size = 'xl' }: ContainerProps) {
  // Mobile-first padding: 4 (16px) on phones, scaling up at sm and lg so
  // editorial gutters breathe on tablets and desktop. 16px is the canonical
  // mobile gutter — same as Apple's HIG and Material's 16dp.
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-8 lg:px-10', sizes[size], className)}>
      {children}
    </div>
  )
}
