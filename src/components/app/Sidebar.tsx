import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { APP_NAV } from './nav'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-cream-200 bg-paper px-5 py-7 sticky top-0">
      {/* Header — logo + editorial volume marker */}
      <div className="flex items-center justify-between">
        <Logo size="h-12 w-12" />
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-400">
          Vol. 01
        </span>
      </div>
      <div className="mt-6 hairline" />

      <nav className="mt-6 flex-1 space-y-0.5">
        {APP_NAV.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-300',
                isActive
                  ? 'bg-cream-100 text-ink-900'
                  : 'text-ink-500 hover:bg-cream-50 hover:text-ink-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-saffron-500 text-cream-50 shadow-soft'
                      : 'bg-cream-100 text-ink-700 group-hover:bg-paper group-hover:text-saffron-700',
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                <span className="text-chapter text-[11px] text-ink-300 tabular-nums">
                  0{i + 1}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2">
        <div className="hairline mb-3" />
        <div className="rounded-2xl bg-cream-100/60 border border-cream-200/60 p-4 ring-inset-warm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-cream-50 font-semibold shadow-soft ring-2 ring-paper">
              {user?.name?.[0] ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{user?.name}</p>
              <p className="caption text-xs text-ink-500 truncate">+91 {user?.phone}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:bg-cream-100 hover:text-ink-900 text-left transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
