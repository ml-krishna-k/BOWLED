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
  DayMenu,
  Delivery,
  Kitchen,
  Meal,
  MealSlot,
  Subscriber,
  AdminGroup,
  AdminSkipNotification,
} from '@/types'
import { WEEKLY_MENU } from '@/data/menu'
import { PLANS } from '@/data/plans'
import { api } from '@/lib/api'
import { applyMenuOverrides, mealToOverridePatch, type MenuOverride } from '@/lib/menu'
import { useAuth } from './AuthContext'

interface AdminValue {
  subscribers: Subscriber[]
  kitchens: Kitchen[]
  groups: AdminGroup[]
  menu: DayMenu[]
  deliveries: Delivery[]
  skipNotifications: AdminSkipNotification[]
  loading: boolean
  todayIdx: number
  kpis: {
    totalSubscribers: number
    active: number
    paused: number
    mealsToday: number
    served: number
    pending: number
    monthRevenue: number
    avgRating: number
  }
  /* mutations */
  markDelivery: (id: string, status: 'served' | 'skipped' | 'pending') => void
  saveMenuMeal: (dayIdx: number, slot: MealSlot, meal: Meal) => Promise<void>
  pauseSubscriber: (id: string) => Promise<void>
  resumeSubscriber: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<AdminValue | null>(null)

function todayMenuIdx(): number {
  return (new Date().getDay() + 6) % 7
}

interface AdminOverview {
  kpis: {
    totalSubscribers: number
    active: number
    paused: number
    monthRevenue: number
    avgRating: number
  }
  kitchens: Kitchen[]
  skipNotifications: AdminSkipNotification[]
}

function buildDeliveries(subs: Subscriber[], dayMenu: DayMenu): Delivery[] {
  const SCHED: Record<MealSlot, string> = {
    breakfast: '08:30',
    lunch: '13:00',
    dinner: '20:00',
  }
  const out: Delivery[] = []
  let i = 0
  for (const s of subs) {
    if (s.status !== 'active') continue
    for (const slot of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
      const meal = dayMenu.meals[slot]
      out.push({
        id: `d_${s.id}_${slot}_${i++}`,
        subscriberId: s.id,
        subscriberName: s.name,
        area: s.area,
        pgName: s.pgName,
        slot,
        mealName: meal.name,
        isVeg: meal.isVeg,
        status: 'pending',
        kitchenId: '',
        scheduledAt: SCHED[slot],
      })
    }
  }
  return out
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const enabled = !!user?.isAdmin

  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [menu, setMenu] = useState<DayMenu[]>(WEEKLY_MENU)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [skipNotifications, setSkipNotifications] = useState<AdminSkipNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [overviewKpis, setOverviewKpis] = useState<AdminOverview['kpis'] | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const [overviewRes, subsRes, menuRes] = await Promise.all([
        api<AdminOverview>('/api/admin/overview'),
        api<{ subscribers: Subscriber[] }>('/api/admin/subscribers'),
        api<{ overrides: MenuOverride[] }>('/api/menu/overrides').catch(() => ({ overrides: [] as MenuOverride[] })),
      ])
      setKitchens(overviewRes.kitchens)
      setSkipNotifications(overviewRes.skipNotifications)
      setOverviewKpis(overviewRes.kpis)
      setSubscribers(subsRes.subscribers)
      const mergedMenu = applyMenuOverrides(menuRes.overrides)
      setMenu(mergedMenu)
      setDeliveries(buildDeliveries(subsRes.subscribers, mergedMenu[todayMenuIdx()]))
    } catch (err) {
      console.error('[admin] refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (authLoading) return
    if (enabled) {
      refresh()
    } else {
      setLoading(false)
    }
  }, [enabled, authLoading, refresh])

  // Live skip-notification updates from the user-side flow happen via the API,
  // not localStorage. We poll every 20s so the admin page picks up new events
  // without a manual refresh.
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(async () => {
      try {
        const data = await api<{ skipNotifications: AdminSkipNotification[] }>('/api/admin/skip-notifications')
        setSkipNotifications(data.skipNotifications)
      } catch {
        /* swallow */
      }
    }, 20_000)
    return () => clearInterval(id)
  }, [enabled])

  const groups = useMemo(() => {
    const map = new Map<string, AdminGroup>()
    for (const s of subscribers) {
      const plan = PLANS.find((p) => p.id === s.planId)
      if (!plan || plan.id === 'solo') continue
      const existing = map.get(s.groupCode)
      if (existing) {
        existing.members += 1
        existing.monthlySavings += plan.savingPerMonth
      } else {
        map.set(s.groupCode, {
          code: s.groupCode,
          members: 1,
          planId: plan.id,
          monthlySavings: plan.savingPerMonth,
          area: s.area,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.members - a.members)
  }, [subscribers])

  const todayIdx = todayMenuIdx()

  const kpis = useMemo(() => {
    const served = deliveries.filter((d) => d.status === 'served').length
    const pending = deliveries.filter((d) => d.status === 'pending').length
    return {
      totalSubscribers: overviewKpis?.totalSubscribers ?? subscribers.length,
      active: overviewKpis?.active ?? subscribers.filter((s) => s.status === 'active').length,
      paused: overviewKpis?.paused ?? subscribers.filter((s) => s.status === 'paused').length,
      mealsToday: deliveries.length,
      served,
      pending,
      monthRevenue: overviewKpis?.monthRevenue ?? 0,
      avgRating: overviewKpis?.avgRating ?? 0,
    }
  }, [overviewKpis, subscribers, deliveries])

  const markDelivery = useCallback<AdminValue['markDelivery']>((id, status) => {
    // Deliveries are derived client-side from the subscribers list for the
    // demo. Status changes are kept in memory only.
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)))
  }, [])

  const saveMenuMeal = useCallback<AdminValue['saveMenuMeal']>(async (dayIdx, slot, meal) => {
    await api<{ override: MenuOverride }>(`/api/menu/admin/${dayIdx}/${slot}`, {
      method: 'PATCH',
      body: mealToOverridePatch(meal),
    })
    setMenu((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, meals: { ...d.meals, [slot]: meal } } : d,
      ),
    )
    if (dayIdx === todayMenuIdx()) {
      setDeliveries((prev) =>
        prev.map((d) => (d.slot === slot ? { ...d, mealName: meal.name, isVeg: meal.isVeg } : d)),
      )
    }
  }, [])

  const pauseSubscriber = useCallback(async (id: string) => {
    await api(`/api/admin/subscribers/${id}/status`, { method: 'PATCH', body: { status: 'paused' } })
    setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'paused' as const } : s)))
  }, [])

  const resumeSubscriber = useCallback(async (id: string) => {
    await api(`/api/admin/subscribers/${id}/status`, { method: 'PATCH', body: { status: 'active' } })
    setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'active' as const } : s)))
  }, [])

  const value = useMemo<AdminValue>(
    () => ({
      subscribers,
      kitchens,
      groups,
      menu,
      deliveries,
      skipNotifications,
      loading,
      todayIdx,
      kpis,
      markDelivery,
      saveMenuMeal,
      pauseSubscriber,
      resumeSubscriber,
      refresh,
    }),
    [subscribers, kitchens, groups, menu, deliveries, skipNotifications, loading, todayIdx, kpis,
      markDelivery, saveMenuMeal, pauseSubscriber, resumeSubscriber, refresh],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdmin(): AdminValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAdmin must be used inside <AdminProvider> (only available to admin users)')
  return v
}
