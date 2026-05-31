import { NavLink } from 'react-router-dom'
import { APP_NAV } from './nav'
import { cn } from '@/lib/cn'

export function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cream-200 bg-paper/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {APP_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-300',
                  isActive ? 'text-saffron-700' : 'text-ink-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-saffron-500 text-cream-50 shadow-soft scale-105'
                        : 'bg-transparent',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
