import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user } = useAuth()
  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-cream-200 bg-cream-50/85 backdrop-blur-lg px-4 py-3"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <Link to="/app/home">
        <Logo />
      </Link>
      <Link
        to="/app/profile"
        className="grid h-9 w-9 place-items-center rounded-full bg-saffron-500 text-cream-50 font-semibold"
        aria-label="Profile"
      >
        {user?.name?.[0] ?? '?'}
      </Link>
    </header>
  )
}
