import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Sidebar } from '@/components/app/Sidebar'
import { BottomNav } from '@/components/app/BottomNav'
import { TopBar } from '@/components/app/TopBar'
import { PhonePromptModal } from '@/components/app/PhonePromptModal'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'

const PHONE_SKIP_KEY = 'bowled:phone-skipped'

export function AppShell() {
  const navigate = useNavigate()
  const loc = useLocation()
  const { isAuthenticated, loading, user, update } = useAuth()
  const { sub, loading: subLoading } = useSubscription()
  const [phoneSkipped, setPhoneSkipped] = useState(
    () => sessionStorage.getItem(PHONE_SKIP_KEY) === '1',
  )
  // Toast shown when a user tries to enter a protected screen without an
  // active subscription. We surface it for ~5 seconds so the redirect to
  // /app/subscription doesn't feel silent.
  const [gateToast, setGateToast] = useState<string | null>(null)
  const lastRedirectFrom = useRef<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
      return
    }
    // Wait for subscription to finish loading before gating — otherwise we'd
    // bounce the user from /app/home before we know whether they actually
    // have a plan.
    if (subLoading) return

    const needsOnboarding = !sub || sub.status !== 'active'
    if (needsOnboarding && loc.pathname !== '/app/subscription') {
      // Only fire the toast once per blocked navigation attempt — don't
      // re-toast on every render that happens to land here after the redirect.
      if (lastRedirectFrom.current !== loc.pathname) {
        lastRedirectFrom.current = loc.pathname
        setGateToast('Pick a plan to unlock this section')
      }
      navigate('/app/subscription', { replace: true })
    } else if (sub?.status === 'active') {
      // Subscription is live — clear any stale gate state.
      lastRedirectFrom.current = null
    }
  }, [isAuthenticated, loading, sub, subLoading, loc.pathname, navigate])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!gateToast) return
    const id = setTimeout(() => setGateToast(null), 5000)
    return () => clearTimeout(id)
  }, [gateToast])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  const needsPhone = !!user && !user.phone && !phoneSkipped

  async function handlePhoneSubmit(phone: string) {
    await update({ phone })
  }

  function handlePhoneSkip() {
    sessionStorage.setItem(PHONE_SKIP_KEY, '1')
    setPhoneSkipped(true)
  }

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

      <PhonePromptModal
        open={needsPhone}
        defaultName={user?.name ?? ''}
        defaultEmail={user?.email ?? ''}
        onSubmit={handlePhoneSubmit}
        onSkip={handlePhoneSkip}
      />

      {/* Subscription gate toast — slides in from the top when a user is
          bounced from a protected screen. Sits below the TopBar; auto-clears. */}
      {gateToast && (
        <div
          role="alert"
          className="fixed left-1/2 top-4 sm:top-6 z-50 -translate-x-1/2 w-[min(92%,420px)] rounded-2xl border border-saffron-300 bg-saffron-50 px-4 py-3 shadow-card animate-fade-up"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron-500 text-cream-50 text-sm">
              !
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">Subscription required</p>
              <p className="mt-0.5 text-xs text-ink-700 leading-snug">{gateToast}</p>
            </div>
            <button
              type="button"
              onClick={() => setGateToast(null)}
              aria-label="Dismiss"
              className="text-ink-500 hover:text-ink-900 -m-1 p-1 shrink-0"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
