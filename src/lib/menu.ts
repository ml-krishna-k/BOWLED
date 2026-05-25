import { useEffect, useState } from 'react'
import type { DayMenu, Meal, MealSlot } from '@/types'
import { WEEKLY_MENU } from '@/data/menu'
import { api } from '@/lib/api'

export interface MenuOverride {
  dayIdx: number
  slot: MealSlot
  name?: string
  description?: string
  calories?: number
  rating?: number
  isVeg?: boolean
  loved?: boolean
  tags?: string[]
  imageUrl?: string
}

/** Apply an array of sparse overrides onto the hardcoded WEEKLY_MENU baseline. */
export function applyMenuOverrides(overrides: MenuOverride[]): DayMenu[] {
  if (overrides.length === 0) return WEEKLY_MENU
  const next: DayMenu[] = WEEKLY_MENU.map((d) => ({
    ...d,
    meals: { ...d.meals },
  }))
  for (const o of overrides) {
    if (o.dayIdx < 0 || o.dayIdx >= next.length) continue
    const day = next[o.dayIdx]
    const base = day.meals[o.slot]
    if (!base) continue
    const merged: Meal = { ...base }
    if (o.name !== undefined) merged.name = o.name
    if (o.description !== undefined) merged.description = o.description
    if (o.calories !== undefined) merged.calories = o.calories
    if (o.rating !== undefined) merged.rating = o.rating
    if (o.isVeg !== undefined) merged.isVeg = o.isVeg
    if (o.loved !== undefined) merged.loved = o.loved
    if (o.tags !== undefined) merged.tags = o.tags
    if (o.imageUrl !== undefined && o.imageUrl !== '') merged.imageUrl = o.imageUrl
    day.meals[o.slot] = merged
  }
  return next
}

/** Public read-only hook — fetches overrides once and returns the merged menu. */
export function useMenu(): { menu: DayMenu[]; loading: boolean } {
  const [menu, setMenu] = useState<DayMenu[]>(WEEKLY_MENU)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api<{ overrides: MenuOverride[] }>('/api/menu/overrides')
      .then((res) => {
        if (cancelled) return
        setMenu(applyMenuOverrides(res.overrides))
      })
      .catch(() => {
        /* fall back silently to hardcoded baseline */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { menu, loading }
}

/** Build the patch body for PATCH /api/menu/admin/:dayIdx/:slot from a full Meal. */
export function mealToOverridePatch(meal: Meal): Omit<MenuOverride, 'dayIdx' | 'slot'> {
  return {
    name: meal.name,
    description: meal.description,
    calories: meal.calories,
    rating: meal.rating,
    isVeg: meal.isVeg,
    loved: !!meal.loved,
    tags: meal.tags,
    imageUrl: meal.imageUrl ?? '',
  }
}
