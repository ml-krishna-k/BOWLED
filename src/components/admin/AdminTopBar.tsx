import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { ADMIN_NAV } from './nav'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

export function AdminTopBar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  // Close the sheet when the user navigates away (clicked a nav item or back-swiped).
  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-cream-200 bg-cream-50/90 backdrop-blur-lg px-4 py-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
      >
        <Link to="/admin/overview" className="flex items-center gap-2">
          <Logo size="h-9 w-9" />
          <Badge tone="ink">Admin</Badge>
        </Link>

        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-full bg-cream-100 text-ink-900 transition-colors active:bg-cream-200 active:scale-95"
          onClick={() => setOpen((s) => !s)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
      </header>

      {/* Slide-down sheet — covers the screen so the admin can pick a section
          without thumb gymnastics. Click backdrop or any link to close. */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm animate-fade-up"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 top-0 bg-paper shadow-card rounded-b-3xl ring-inset-warm"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header — mirrors collapsed bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Logo size="h-9 w-9" />
                <Badge tone="ink">Admin</Badge>
              </div>
              <button
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full bg-cream-100 text-ink-900 active:scale-95"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </svg>
              </button>
            </div>

            {/* Nav list */}
            <nav className="px-3 py-3">
              {ADMIN_NAV.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors',
                      isActive
                        ? 'bg-cream-100 text-ink-900'
                        : 'text-ink-700 active:bg-cream-100 hover:bg-cream-50',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'grid h-10 w-10 place-items-center rounded-lg shrink-0 transition-colors',
                          isActive
                            ? 'bg-saffron-500 text-cream-50 shadow-soft'
                            : 'bg-cream-100 text-ink-700',
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-chapter text-xs text-ink-300 tabular-nums">
                        0{i + 1}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-cream-200 px-4 py-4 space-y-3 bg-cream-50/60 rounded-b-3xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-cream-50 font-semibold shadow-soft ring-2 ring-paper">
                  {user?.name?.[0] ?? '?'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900 text-sm">{user?.name}</p>
                  <p className="truncate text-xs text-ink-500">+91 {user?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto rounded-xl px-3 py-2 text-sm font-medium text-spice-700 hover:bg-spice-50 active:bg-spice-100"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
