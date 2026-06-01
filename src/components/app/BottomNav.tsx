import { NavLink } from 'react-router-dom'
import { APP_NAV } from './nav'
import { cn } from '@/lib/cn'

export function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cream-200 bg-paper/95 backdrop-blur-xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <ul className="grid grid-cols-5">
        {APP_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              // Mobile-first: 60px+ touch target by combining py-3 + icon size,
              // exceeds Apple HIG's 44px minimum. active:scale gives haptic feel.
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-3 px-1 text-[11px] font-medium transition-colors duration-300 active:scale-95',
                  isActive ? 'text-saffron-700' : 'text-ink-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-saffron-500 text-cream-50 shadow-soft scale-105'
                        : 'bg-transparent',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={cn('truncate max-w-full', isActive && 'font-semibold')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
