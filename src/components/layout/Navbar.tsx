import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const isAdmin = !!user?.isAdmin
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'pt-3' : 'pt-5',
      )}
    >
      <Container size="xl">
        <nav
          className={cn(
            'flex items-center justify-between rounded-full px-3 sm:px-5 py-2.5',
            'transition-[background,box-shadow,border-color,padding] duration-500 ease-out',
            scrolled
              ? 'card-glass-strong shadow-card'
              : 'bg-paper/30 backdrop-blur-sm border border-transparent',
          )}
        >
          <a
            href="#"
            className="shrink-0 transition-transform duration-300 hover:scale-[1.02] pl-1"
          >
            <Logo />
          </a>

          <ul className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors duration-300 hover:text-ink-900"
                >
                  <span className="relative z-10">{link.label}</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-cream-100/0 transition-colors duration-300 group-hover:bg-cream-100"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && <Badge tone="ink">Admin</Badge>}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(isAdmin ? '/admin/overview' : '/app/home')}
                  trailing={
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 5 7 7-7 7" />
                    </svg>
                  }
                >
                  Open {isAdmin ? 'console' : 'app'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Log in
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/auth/signup')}>
                  Start trial
                </Button>
              </>
            )}
          </div>

          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-cream-100 text-ink-900 transition-colors hover:bg-cream-200"
            onClick={() => setOpen((s) => !s)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </nav>

        {open && (
          <div className="mt-3 md:hidden card-glass-strong rounded-3xl shadow-card p-4 space-y-1 animate-fade-up">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-[15px] font-medium text-ink-700 transition-colors hover:bg-cream-100 hover:text-ink-900"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="col-span-2"
                  onClick={() => { setOpen(false); navigate(isAdmin ? '/admin/overview' : '/app/home') }}
                >
                  Open {isAdmin ? 'console' : 'app'} →
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setOpen(false); navigate('/auth/login') }}>
                    Log in
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setOpen(false); navigate('/auth/signup') }}>
                    Start trial
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
