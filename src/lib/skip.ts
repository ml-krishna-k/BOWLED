import type {
  MealSlot,
  SkippedDay,
  SkippedMeal,
  Subscription,
} from '@/types'
import { BILLING_CYCLES } from '@/data/plans'

export const SKIP_LIMITS = {
  meal: 5,
  day: 3,
} as const

/** Local-time 'YYYY-MM-DD'. Avoids UTC drift from toISOString(). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const todayKey = () => toDateKey(new Date())

/** Friendly label: "Tue, 26 May". */
export function formatSkipDate(key: string): string {
  return fromDateKey(key).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

export function isMonthlyCycle(sub: Pick<Subscription, 'billingCycleId'>): boolean {
  const cycle = BILLING_CYCLES.find((c) => c.id === sub.billingCycleId)
  return cycle?.cadence === 'Monthly'
}

/** Skips inside the current billing cycle (the 30-day window from cycleStartedAt). */
export function currentCycleMealSkips(sub: Subscription): SkippedMeal[] {
  const cutoff = toDateKey(new Date(sub.cycleStartedAt))
  return sub.mealSkips.filter((s) => s.date >= cutoff)
}

export function currentCycleDaySkips(sub: Subscription): SkippedDay[] {
  const cutoff = toDateKey(new Date(sub.cycleStartedAt))
  return sub.daySkips.filter((s) => s.date >= cutoff)
}

export function upcomingSkips<T extends { date: string }>(items: T[]): T[] {
  const t = todayKey()
  return [...items].filter((s) => s.date >= t).sort((a, b) => a.date.localeCompare(b.date))
}

/* ---------------------------------------------------------------------------
 * Skip cutoffs — how late can a skip be confirmed?
 *
 *   • Full-day skip  →  by the end of the previous day (i.e., before the
 *     target date begins).
 *   • Breakfast      →  by 9 PM the day before  (one slot prior = previous
 *                       day's dinner ending).
 *   • Lunch          →  by 9 AM the same day    (one slot prior = breakfast
 *                       ending).
 *   • Dinner         →  by 12 PM the same day   (must be finalised in the
 *                       morning).
 * ------------------------------------------------------------------------- */

export type SkipTarget = { date: string; slot?: MealSlot }

export function getSkipCutoff(target: SkipTarget): Date {
  const d = fromDateKey(target.date)
  if (!target.slot) {
    // Full day: cutoff is the start of the target date — i.e., must submit
    // *before* the day begins.
    return d
  }
  switch (target.slot) {
    case 'breakfast': {
      const prev = new Date(d)
      prev.setDate(d.getDate() - 1)
      prev.setHours(21, 0, 0, 0)
      return prev
    }
    case 'lunch': {
      const cut = new Date(d)
      cut.setHours(9, 0, 0, 0)
      return cut
    }
    case 'dinner': {
      const cut = new Date(d)
      cut.setHours(12, 0, 0, 0)
      return cut
    }
  }
}

export function isPastCutoff(target: SkipTarget, now: Date = new Date()): boolean {
  return now.getTime() >= getSkipCutoff(target).getTime()
}

/** Friendly description shown beneath the picker. */
export function describeCutoff(target: SkipTarget): string {
  if (!target.slot) return 'by the end of the previous day'
  switch (target.slot) {
    case 'breakfast': return 'by 9 PM the day before'
    case 'lunch':     return 'by 9 AM the same day'
    case 'dinner':    return 'by 12 PM (noon) the same day'
  }
}

/** Earliest date the user is allowed to pick for the given slot (or full day). */
export function earliestValidDate(slot: MealSlot | undefined, now: Date = new Date()): string {
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    d.setHours(0, 0, 0, 0)
    const key = toDateKey(d)
    if (!isPastCutoff({ date: key, slot }, now)) return key
  }
  return toDateKey(now)
}
