import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from '@/components/app/Sidebar'
import { BottomNav } from '@/components/app/BottomNav'
import { TopBar } from '@/components/app/TopBar'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'

export function AppShell() {
  const navigate = useNavigate()
  const loc = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const { sub } = useSubscription()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
      return
    }
    // Users without a sub OR with a non-active sub (pending payment / expired)
    // are routed to /app/subscription where the Onboarding / pending-payment
    // / expired screens live.
    const needsOnboarding = !sub || sub.status !== 'active'
    if (needsOnboarding && loc.pathname !== '/app/subscription') {
      navigate('/app/subscription', { replace: true })
    }
  }, [isAuthenticated, loading, sub, loc.pathname, navigate])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  if (loading || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <div className="text-ink-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TopBar />
          <main className="pb-24 lg:pb-12">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
