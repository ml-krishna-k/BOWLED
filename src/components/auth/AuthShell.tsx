import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

interface AuthShellProps {
  children: ReactNode
  step?: { current: number; total: number; label?: string }
  footer?: ReactNode
}

export function AuthShell({ children, step, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12">
      {/* Left — content (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-cream-50">
        <header className="flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-7">
          <Link to="/" className="transition-transform hover:scale-[1.02]">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            {step && (
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-500">
                <span className="text-chapter text-base text-saffron-500 tabular-nums">
                  0{step.current}
                </span>
                <span className="text-ink-300">/</span>
                <span className="text-chapter text-base text-ink-300 tabular-nums">
                  0{step.total}
                </span>
                {step.label && (
                  <span className="ml-2 text-ink-500 hidden sm:inline">— {step.label}</span>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="px-6 sm:px-10 lg:px-14 mt-6 hairline" />

        <main className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-14 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {footer && (
          <footer className="px-6 sm:px-10 lg:px-14 py-7 text-center caption text-ink-500 border-t border-cream-200/70">
            {footer}
          </footer>
        )}
      </div>

      {/* Right — editorial cover panel (5 cols) */}
      <aside className="lg:col-span-5 relative hidden lg:block overflow-hidden bg-ink-900">
        {/* Layered warmth */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(245,106,27,0.5)_0%,rgba(245,106,27,0)_60%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-32 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(255,174,107,0.35),transparent_70%)] animate-breathe"
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(155,189,135,0.18),transparent_70%)]"
        />
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />

        {/* Vertical magazine spine */}
        <span
          aria-hidden
          className="absolute left-7 top-12 text-vertical text-cream-50/50"
        >
          Vol. 01 — Bowled · Chennai
        </span>

        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
          {/* Editorial header strip */}
          <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.2em] uppercase text-cream-50/60">
            <span>The kitchen issue</span>
            <span className="inline-flex items-center gap-2 text-leaf-300">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-400 animate-pulse-dot" />
              Live
            </span>
          </div>

          {/* Magazine-cover headline */}
          <div className="space-y-7">
            <p className="text-eyebrow text-saffron-300">Bowled · Chennai</p>
            <h2 className="text-display text-5xl xl:text-[4rem] text-cream-50 leading-[0.98] tracking-[-0.035em]">
              Three home-
              <br />
              cooked meals.
              <br />
              <span className="italic font-light text-saffron-300">
                Every day.
              </span>
            </h2>
            <div className="hairline opacity-30 max-w-[10rem]" />
            <p className="caption text-cream-50/70 max-w-sm">
              Pay once, eat for thirty days. Bring your roommates and pay even less.
              Your QR pass takes care of the rest.
            </p>
          </div>

          {/* Editorial footer with stats */}
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <CoverStat figure="300" unit="+" label="Daily eaters" />
              <CoverStat figure="4.8" unit="/ 5" label="Avg. rating" />
              <CoverStat figure="20" unit="yrs" label="Of craft" />
            </div>
            <div className="hairline opacity-25" />
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-cream-50/45">
              A venture by Sree Krishna Catering · since 2006
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function CoverStat({
  figure,
  unit,
  label,
}: {
  figure: string
  unit: string
  label: string
}) {
  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="text-editorial text-2xl xl:text-3xl text-cream-50">{figure}</span>
        <span className="text-xs text-cream-50/45 font-medium">{unit}</span>
      </p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-cream-50/45">
        {label}
      </p>
    </div>
  )
}
