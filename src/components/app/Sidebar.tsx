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
      <Logo />

      <nav className="mt-10 flex-1 space-y-1">
        {APP_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-cream-100 text-ink-900'
                  : 'text-ink-500 hover:bg-cream-100 hover:text-ink-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg transition-colors',
                    isActive ? 'bg-saffron-500 text-cream-50' : 'bg-cream-100 text-ink-700 group-hover:bg-paper',
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2">
        <div className="rounded-2xl bg-cream-100 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-cream-50 font-semibold">
              {user?.name?.[0] ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{user?.name}</p>
              <p className="truncate text-xs text-ink-500">+91 {user?.phone}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:bg-cream-100 hover:text-ink-900 text-left"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
