import { useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { WEEKLY_MENU } from '@/data/menu'
import type { MealSlot } from '@/types'
import { cn } from '@/lib/cn'

const SLOTS: { id: MealSlot; label: string; time: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', time: '7 – 9 AM', icon: '🌅' },
  { id: 'lunch',     label: 'Lunch',     time: '12:30 – 2 PM', icon: '🍛' },
  { id: 'dinner',    label: 'Dinner',    time: '7:30 – 9 PM', icon: '🌙' },
]

type Filter = 'all' | 'veg' | 'nonveg'

export function MenuPage() {
  const todayIdx = (new Date().getDay() + 6) % 7
  const [dayIdx, setDayIdx] = useState(todayIdx)
  const [filter, setFilter] = useState<Filter>('all')
  const day = WEEKLY_MENU[dayIdx]

  const matches = (isVeg: boolean) =>
    filter === 'all' ? true : filter === 'veg' ? isVeg : !isVeg

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Weekly menu"
        title="What's on this week"
        description="Chef-rotated weekly. Tap any day to preview all 3 meals."
      />

      {/* Day picker */}
      <div className="mt-8 overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 rounded-2xl bg-paper border border-cream-200 p-2">
          {WEEKLY_MENU.map((d, i) => {
            const isToday = i === todayIdx
            const active = i === dayIdx
            return (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                className={cn(
                  'flex-1 min-w-[64px] rounded-xl px-3 py-2.5 text-center transition-colors',
                  active
                    ? 'bg-ink-900 text-cream-50'
                    : 'text-ink-700 hover:bg-cream-100',
                )}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-70">{d.short}</p>
                <p className="font-display text-sm sm:text-base">{d.day.slice(0, 3)}</p>
                {isToday && !active && (
                  <p className="mt-0.5 text-[10px] font-semibold text-saffron-700">Today</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-5 flex gap-2">
        {(
          [
            { id: 'all',    label: 'All' },
            { id: 'veg',    label: '🌿 Vegetarian' },
            { id: 'nonveg', label: '🍗 Non-veg' },
          ] as { id: Filter; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors border',
              filter === f.id
                ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                : 'border-cream-200 bg-paper text-ink-500 hover:border-cream-300',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Meals for the day */}
      <div className="mt-6 space-y-4">
        {SLOTS.map((slot) => {
          const meal = day.meals[slot.id]
          const dim = !matches(meal.isVeg)
          return (
            <Card
              key={slot.id}
              className={cn('overflow-hidden transition-opacity', dim && 'opacity-50')}
            >
              <div className="grid md:grid-cols-3">
                <div
                  className={cn(
                    'relative min-h-[160px] md:min-h-full',
                    meal.isVeg
                      ? 'bg-gradient-to-br from-leaf-100 via-cream-100 to-saffron-100'
                      : 'bg-gradient-to-br from-saffron-200 via-saffron-100 to-cream-100',
                  )}
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-grain opacity-50" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-28 w-28 rounded-full bg-paper shadow-card grid place-items-center">
                      <div
                        className={cn(
                          'h-20 w-20 rounded-full',
                          meal.isVeg
                            ? 'bg-gradient-to-br from-leaf-300 to-leaf-500'
                            : 'bg-gradient-to-br from-saffron-400 to-spice-500',
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-eyebrow text-ink-500">
                        {slot.icon} {slot.label} · {slot.time}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-ink-900">{meal.name}</h3>
                    </div>
                    {meal.loved && <Badge tone="saffron">❤ Most loved</Badge>}
                  </div>

                  <p className="mt-3 text-ink-500 leading-relaxed">{meal.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone={meal.isVeg ? 'leaf' : 'saffron'}>
                      {meal.isVeg ? 'Veg' : 'Non-veg'}
                    </Badge>
                    {meal.tags.map((t) => (
                      <span key={t} className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-700">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4 text-sm text-ink-500">
                    <span>{meal.calories} kcal</span>
                    <span className="font-semibold text-ink-900">★ {meal.rating}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </AppContainer>
  )
}
