import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user } = useAuth()
  return (
    <header
      className="lg:hidden sticky top-0 z-30 border-b border-cream-200 bg-cream-50/85 backdrop-blur-lg"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/app/home" className="transition-transform hover:scale-[1.02]">
          <Logo size="h-10 w-10" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-400 hidden sm:inline">
            Vol. 01
          </span>
          <Link
            to="/app/profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-saffron-500 text-cream-50 font-semibold shadow-soft ring-2 ring-paper transition-transform hover:scale-105"
            aria-label="Profile"
          >
            {user?.name?.[0] ?? '?'}
          </Link>
        </div>
      </div>
    </header>
  )
}
