import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: string
  className?: string
  icon?: string
}

export function Eyebrow({ children, className, icon = '✦' }: EyebrowProps) {
  return (
    <div className={cn('text-eyebrow flex items-center gap-2', className)}>
      <span aria-hidden className="text-saffron-500">{icon}</span>
      <span>{children}</span>
    </div>
  )
}
