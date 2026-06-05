import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  MealSlot,
  Subscription,
  Plan,
  PaymentInstructions,
  ServedMeal,
  SkippedMeal,
  SkippedDay,
} from '@/types'
import { PLANS } from '@/data/plans'
import { WEEKLY_MENU } from '@/data/menu'
import { useMenu } from '@/lib/menu'
import {
  currentCycleDaySkips,
  currentCycleMealSkips,
  isMonthlyCycle,
  SKIP_LIMITS,
  upcomingSkips,
} from '@/lib/skip'
import { api, ApiError } from '@/lib/api'
import { useAuth } from './AuthContext'

type BillingCycleId = Subscription['billingCycleId']

export type SkipResult =
  | { ok: true }
  | { ok: false; reason: 'not-monthly' | 'limit-reached' | 'duplicate' | 'past-date' | 'cutoff-passed' | 'unknown' }

interface SubscriptionValue {
  sub: Subscription | null
  /** Set when sub.status === 'pending_payment'. Carries UPI QR + ref + amount. */
  paymentInstructions: PaymentInstructions | null
  plan: Plan | null
  loading: boolean
  dayNumber: number
  mealsRemaining: number
  todayDay: typeof WEEKLY_MENU[number]
  nextSlot: MealSlot | null
  isMonthly: boolean
  mealSkipsUsed: number
  mealSkipsLeft: number
  daySkipsUsed: number
  daySkipsLeft: number
  upcomingMealSkips: SkippedMeal[]
  upcomingDaySkips: SkippedDay[]
  /* mutations */
  subscribe: (
    planId: Plan['id'],
    groupCode?: string,
    groupSize?: number,
    billingCycleId?: BillingCycleId,
  ) => Promise<void>
  changeCycle: (billingCycleId: BillingCycleId) => Promise<void>
  scanMeal: (slot?: MealSlot) => Promise<ServedMeal | null>
  rescheduleNextSlot: () => Promise<void>
  pause: (fromIso: string, toIso: string) => Promise<void>
  resume: () => Promise<void>
  reset: () => Promise<void>
  skipMeal: (date: string, slot: MealSlot) => Promise<SkipResult>
  skipDay: (date: string) => Promise<SkipResult>
  removeMealSkip: (id: string) => Promise<void>
  removeDaySkip: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<SubscriptionValue | null>(null)
const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner']

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSub(null)
      setPaymentInstructions(null)
      return
    }
    try {
      const data = await api<{ subscription: Subscription | null; paymentInstructions: PaymentInstructions | null }>('/api/subscription')
      setSub(data.subscription)
      setPaymentInstructions(data.paymentInstructions ?? null)
    } catch {
      /* leave existing sub in place — caller doesn't need to know about transient failures */
    }
  }, [isAuthenticated])

  // Load subscription on auth state change.
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setSub(null)
      setPaymentInstructions(null)
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      await refresh()
      setLoading(false)
    })()
  }, [isAuthenticated, authLoading, refresh])

  const plan = useMemo(() => (sub ? PLANS.find((p) => p.id === sub.planId) ?? null : null), [sub])

  const dayNumber = useMemo(() => {
    if (!sub) return 0
    const days = Math.floor((Date.now() - sub.startedAt) / (24 * 60 * 60 * 1000))
    return Math.min(30, Math.max(1, days + 1))
  }, [sub])

  // Pull the API-merged menu (admin overrides on top of the static baseline)
  // so the Dashboard "next meal" copy stays in sync with the /admin/menu
  // editor. Falls back to the baseline while the API call is in flight.
  const { menu: mergedMenu } = useMenu()
  const todayDay = useMemo(() => {
    const idx = new Date().getDay()
    const mondayBased = (idx + 6) % 7
    return mergedMenu[mondayBased] ?? WEEKLY_MENU[mondayBased]
  }, [mergedMenu])

  const nextSlot = useMemo<MealSlot | null>(() => {
    if (!sub) return null
    return SLOT_ORDER.find((s) => sub.today[s] === 'pending') ?? null
  }, [sub])

  const mealsRemaining = sub ? sub.totalMeals - sub.mealsServed : 0

  /* ---------- Mutations ---------------------------------------------------- */

  const subscribe = useCallback<SubscriptionValue['subscribe']>(
    async (planId, groupCode, groupSize, billingCycleId) => {
      const data = await api<{ subscription: Subscription; paymentInstructions: PaymentInstructions | null }>('/api/subscription', {
        body: {
          planId,
          groupCode,
          groupSize: groupSize ?? (planId === 'solo' ? 1 : planId === 'squad' ? 5 : 10),
          billingCycleId: billingCycleId ?? 'monthly-no-sun',
        },
      })
      setSub(data.subscription)
      setPaymentInstructions(data.paymentInstructions ?? null)
    },
    [],
  )

  const scanMeal = useCallback<SubscriptionValue['scanMeal']>(
    async (slot) => {
      if (!sub) return null
      const target = slot ?? SLOT_ORDER.find((s) => sub.today[s] === 'pending')
      if (!target) return null
      const mealName = todayDay.meals[target].name
      try {
        const data = await api<{ subscription: Subscription }>('/api/subscription/scan', {
          body: { slot: target, mealName },
        })
        setSub(data.subscription)
        return data.subscription.history?.[0] ?? null
      } catch {
        return null
      }
    },
    [sub, todayDay],
  )

  const rescheduleNextSlot = useCallback(async () => {
    try {
      const data = await api<{ subscription: Subscription }>('/api/subscription/skip-next', { method: 'POST' })
      setSub(data.subscription)
    } catch {
      /* ignore */
    }
  }, [])

  const pause = useCallback(async (fromIso: string, toIso: string) => {
    const data = await api<{ subscription: Subscription }>('/api/subscription/pause', {
      body: { fromIso, toIso },
    })
    setSub(data.subscription)
  }, [])

  const resume = useCallback(async () => {
    const data = await api<{ subscription: Subscription }>('/api/subscription/resume', { method: 'POST' })
    setSub(data.subscription)
  }, [])

  const reset = useCallback(async () => {
    await api('/api/subscription', { method: 'DELETE' })
    setSub(null)
    setPaymentInstructions(null)
  }, [])

  const changeCycle = useCallback<SubscriptionValue['changeCycle']>(async (billingCycleId) => {
    const data = await api<{ subscription: Subscription }>('/api/subscription', {
      method: 'PATCH',
      body: { billingCycleId },
    })
    setSub(data.subscription)
  }, [])

  const skipMeal = useCallback<SubscriptionValue['skipMeal']>(
    async (date, slot) => {
      try {
        const data = await api<{ subscription: Subscription }>('/api/subscription/skip-meal', {
          body: { date, slot },
        })
        setSub(data.subscription)
        return { ok: true }
      } catch (err) {
        return { ok: false, reason: errorReason(err) }
      }
    },
    [],
  )

  const skipDay = useCallback<SubscriptionValue['skipDay']>(
    async (date) => {
      try {
        const data = await api<{ subscription: Subscription }>('/api/subscription/skip-day', {
          body: { date },
        })
        setSub(data.subscription)
        return { ok: true }
      } catch (err) {
        return { ok: false, reason: errorReason(err) }
      }
    },
    [],
  )

  const removeMealSkip = useCallback(async (id: string) => {
    const data = await api<{ subscription: Subscription }>(`/api/subscription/skips/meal/${id}`, { method: 'DELETE' })
    setSub(data.subscription)
  }, [])

  const removeDaySkip = useCallback(async (id: string) => {
    const data = await api<{ subscription: Subscription }>(`/api/subscription/skips/day/${id}`, { method: 'DELETE' })
    setSub(data.subscription)
  }, [])

  /* ---------- Derived skip counts ----------------------------------------- */

  const isMonthly = sub ? isMonthlyCycle(sub) : false
  const mealSkipsUsed = sub ? currentCycleMealSkips(sub).length : 0
  const daySkipsUsed = sub ? currentCycleDaySkips(sub).length : 0
  const mealSkipsLeft = Math.max(0, SKIP_LIMITS.meal - mealSkipsUsed)
  const daySkipsLeft = Math.max(0, SKIP_LIMITS.day - daySkipsUsed)
  const upcomingMealSkips = useMemo(() => (sub ? upcomingSkips(sub.mealSkips) : []), [sub])
  const upcomingDaySkips = useMemo(() => (sub ? upcomingSkips(sub.daySkips) : []), [sub])

  const value = useMemo<SubscriptionValue>(
    () => ({
      sub, paymentInstructions, plan, loading, dayNumber, mealsRemaining, todayDay, nextSlot,
      isMonthly, mealSkipsUsed, mealSkipsLeft, daySkipsUsed, daySkipsLeft,
      upcomingMealSkips, upcomingDaySkips,
      subscribe, changeCycle, scanMeal, rescheduleNextSlot, pause, resume, reset,
      skipMeal, skipDay, removeMealSkip, removeDaySkip, refresh,
    }),
    [
      sub, paymentInstructions, plan, loading, dayNumber, mealsRemaining, todayDay, nextSlot,
      isMonthly, mealSkipsUsed, mealSkipsLeft, daySkipsUsed, daySkipsLeft,
      upcomingMealSkips, upcomingDaySkips,
      subscribe, changeCycle, scanMeal, rescheduleNextSlot, pause, resume, reset, refresh,
      skipMeal, skipDay, removeMealSkip, removeDaySkip,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function errorReason(err: unknown): Exclude<SkipResult, { ok: true }>['reason'] {
  if (err instanceof ApiError && err.reason) {
    const r = err.reason
    if (r === 'not-monthly' || r === 'limit-reached' || r === 'duplicate' || r === 'past-date' || r === 'cutoff-passed') {
      return r
    }
  }
  return 'unknown'
}

export function useSubscription(): SubscriptionValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSubscription must be used inside <SubscriptionProvider>')
  return v
}
