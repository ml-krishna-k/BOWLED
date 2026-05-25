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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — content */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 sm:px-10 py-6">
          <Link to="/">
            <Logo />
          </Link>
          {step && (
            <div className="flex items-center gap-2 text-xs text-ink-500">
              {Array.from({ length: step.total }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-1.5 rounded-full transition-all ' +
                    (i < step.current ? 'w-8 bg-saffron-500' : 'w-4 bg-cream-300')
                  }
                />
              ))}
              {step.label && <span className="ml-2 text-ink-500">{step.label}</span>}
            </div>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {footer && (
          <footer className="px-6 sm:px-10 py-6 text-center text-xs text-ink-500">{footer}</footer>
        )}
      </div>

      {/* Right — ambient panel */}
      <aside className="relative hidden lg:block overflow-hidden bg-cream-100">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(255,174,107,0.55)_0%,rgba(255,174,107,0)_60%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(155,189,135,0.4),transparent_70%)]"
        />
        <div className="absolute inset-0 bg-grain opacity-50" aria-hidden />

        <div className="relative h-full flex flex-col justify-between p-12">
          <div />
          <div>
            <p className="text-eyebrow text-saffron-600">Bowled · Chennai</p>
            <h2 className="mt-4 text-display text-4xl xl:text-5xl text-ink-900 leading-tight max-w-md">
              Three home-cooked meals.
              <br />
              Every day.
              <br />
              <span className="text-saffron-600">From your city.</span>
            </h2>
            <p className="mt-5 text-ink-500 max-w-sm leading-relaxed">
              Pay once, eat for 30 days. Bring your roommates and pay even less. Your QR pass takes care of the rest.
            </p>
            <p className="mt-4 text-xs text-ink-500">
              A venture by Sree Krishna Catering · feeding Chennai since 2006.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-leaf-500 animate-pulse" />
            <span>300+ students eating with us daily across Chennai</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
