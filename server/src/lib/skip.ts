/**
 * Server-side mirror of the client's skip rules. Keep in sync with
 * src/lib/skip.ts on the frontend.
 */

type Slot = 'breakfast' | 'lunch' | 'dinner'

export const SKIP_LIMITS = { meal: 5, day: 3 } as const

function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function getSkipCutoff(target: { date: string; slot?: Slot }): Date {
  const d = fromDateKey(target.date)
  if (!target.slot) return d
  switch (target.slot) {
    case 'breakfast': {
      const prev = new Date(d); prev.setDate(d.getDate() - 1); prev.setHours(21, 0, 0, 0)
      return prev
    }
    case 'lunch':  { const c = new Date(d); c.setHours( 9, 0, 0, 0); return c }
    case 'dinner': { const c = new Date(d); c.setHours(12, 0, 0, 0); return c }
  }
}

export function isPastCutoff(target: { date: string; slot?: Slot }, now = new Date()): boolean {
  return now.getTime() >= getSkipCutoff(target).getTime()
}

export function currentCycleSkips<T extends { date: string }>(items: T[], cycleStartedAt: number): T[] {
  const cutoff = toDateKey(new Date(cycleStartedAt))
  return items.filter((s) => s.date >= cutoff)
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
