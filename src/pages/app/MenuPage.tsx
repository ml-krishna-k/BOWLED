import { useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { WEEKLY_MENU } from '@/data/menu'
import type { MealSlot } from '@/types'
import { cn } from '@/lib/cn'

const SLOTS: { id: MealSlot; label: string; time: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', time: '7 – 9 AM',     icon: '🌅' },
  { id: 'lunch',     label: 'Lunch',     time: '12:30 – 2 PM', icon: '🍛' },
  { id: 'dinner',    label: 'Dinner',    time: '7:30 – 9 PM',  icon: '🌙' },
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
        chapter="Vol. 01"
        title={<>What&apos;s on <span className="italic font-light text-saffron-600">this week.</span></>}
        description="Chef-rotated weekly. Tap any day to preview all three meals."
      />

      {/* Day picker — pill row with editorial labels */}
      <div className="mt-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-2xl bg-paper border border-cream-200 p-1.5 shadow-soft ring-inset-warm">
          {WEEKLY_MENU.map((d, i) => {
            const isToday = i === todayIdx
            const active = i === dayIdx
            return (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                className={cn(
                  'flex-1 min-w-[64px] rounded-xl px-3 py-3 text-center transition-all duration-300',
                  active
                    ? 'bg-ink-900 text-cream-50 shadow-soft scale-[1.02]'
                    : 'text-ink-700 hover:bg-cream-100',
                )}
              >
                <p className={cn(
                  'text-[10px] uppercase tracking-[0.18em] font-semibold',
                  active ? 'text-cream-50/70' : 'text-ink-400',
                )}>
                  {d.short}
                </p>
                <p className="font-display text-base sm:text-lg mt-0.5 tracking-tight">
                  {d.day.slice(0, 3)}
                </p>
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
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 border',
              filter === f.id
                ? 'border-saffron-500 bg-saffron-50 text-saffron-700 shadow-soft'
                : 'border-cream-200 bg-paper text-ink-500 hover:border-cream-300',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Editorial day intro */}
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-eyebrow text-saffron-600">{day.day}&apos;s table</p>
          <h2 className="mt-2 text-display text-3xl tracking-tight text-ink-900">
            Three meals, <span className="italic font-light">one rhythm.</span>
          </h2>
        </div>
        <span className="text-chapter text-base text-saffron-500 tabular-nums hidden sm:inline">
          {String(dayIdx + 1).padStart(2, '0')} / 07
        </span>
      </div>

      {/* Meals — editorial spreads, alternating image / copy */}
      <div className="mt-6">
        <div className="hairline" />
        {SLOTS.map((slot, i) => {
          const meal = day.meals[slot.id]
          const dim = !matches(meal.isVeg)
          const flip = i % 2 === 1
          return (
            <article
              key={slot.id}
              className={cn(
                'group grid sm:grid-cols-12 gap-6 sm:gap-10 py-8 sm:py-10 border-b border-cream-200/70 transition-opacity duration-300',
                dim && 'opacity-40',
              )}
            >
              {/* Plate visual */}
              <figure
                className={cn(
                  'sm:col-span-5 relative aspect-[5/4] sm:aspect-auto sm:min-h-[200px] rounded-2xl overflow-hidden ring-inset-warm',
                  flip ? 'sm:order-2' : 'sm:order-1',
                  meal.isVeg
                    ? 'bg-gradient-to-br from-leaf-100 via-cream-100 to-saffron-100'
                    : 'bg-gradient-to-br from-saffron-200 via-saffron-100 to-cream-100',
                )}
                aria-hidden
              >
                <div className="absolute inset-0 bg-grain opacity-40" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-32 w-32 rounded-full bg-paper shadow-card grid place-items-center transition-transform duration-700 group-hover:scale-105">
                    <div
                      className={cn(
                        'h-24 w-24 rounded-full',
                        meal.isVeg
                          ? 'bg-gradient-to-br from-leaf-300 to-leaf-500'
                          : 'bg-gradient-to-br from-saffron-400 to-spice-500',
                      )}
                    />
                  </div>
                </div>
                {/* Slot tag */}
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1 text-[11px] font-semibold text-ink-700 shadow-soft backdrop-blur-sm tracking-[0.15em] uppercase">
                  <span>{slot.icon}</span>
                  {slot.label}
                </span>
              </figure>

              {/* Copy */}
              <div className={cn(
                'sm:col-span-7 flex flex-col',
                flip ? 'sm:order-1' : 'sm:order-2',
              )}>
                <div className="flex items-baseline justify-between">
                  <p className="text-chapter text-xl text-saffron-500 tabular-nums">
                    0{i + 1}
                  </p>
                  {meal.loved && <Badge tone="saffron" dot>Most loved</Badge>}
                </div>

                <p className="mt-2 caption text-ink-500">{slot.time}</p>

                <h3 className="mt-2 text-display text-2xl sm:text-3xl tracking-tight leading-tight text-ink-900">
                  {meal.name}
                </h3>

                <p className="mt-3 text-ink-500 text-[15px] leading-relaxed max-w-lg">
                  {meal.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone={meal.isVeg ? 'leaf' : 'saffron'} dot>
                    {meal.isVeg ? 'Veg' : 'Non-veg'}
                  </Badge>
                  {meal.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-700 ring-1 ring-cream-200/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5 flex items-center justify-between text-sm text-ink-500">
                  <span>{meal.calories} kcal</span>
                  <span className="font-semibold text-ink-900 inline-flex items-center gap-1">
                    <span className="text-saffron-500">★</span>{meal.rating}
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </AppContainer>
  )
}
