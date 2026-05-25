import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl bg-saffron-500 text-white shadow-glow"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-2-7-6-11Z" />
          <path d="M12 13c2 0 3-1 3-3" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink-900">
          Bow<span className="text-saffron-500">led</span>
        </span>
      )}
    </div>
  )
}
