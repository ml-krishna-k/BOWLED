import { useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { MealSlot } from '@/types'
import { cn } from '@/lib/cn'
import { useMenu } from '@/lib/menu'

const SLOTS: { id: MealSlot; label: string; time: string }[] = [
  { id: 'breakfast', label: 'Breakfast', time: '7 – 9 AM' },
  { id: 'lunch',     label: 'Lunch',     time: '12:30 – 2 PM' },
  { id: 'dinner',    label: 'Dinner',    time: '7:30 – 9 PM' },
]

type Filter = 'all' | 'veg' | 'nonveg'

export function WeeklyMenu() {
  const { menu } = useMenu()
  const [dayIdx, setDayIdx] = useState(2) // start on Wednesday
  const [slot, setSlot] = useState<MealSlot>('lunch')
  const [filter, setFilter] = useState<Filter>('all')

  const day = menu[dayIdx]
  const meal = day.meals[slot]

  const compatible = useMemo(() => {
    if (filter === 'all') return true
    if (filter === 'veg') return meal.isVeg
    return !meal.isVeg
  }, [filter, meal.isVeg])

  return (
    <Section id="menu" className="bg-mist">
      <Container>
        <SectionHeading
          eyebrow="Weekly rotating menu"
          title={<>Real food you'd <span className="text-saffron-600">actually look forward to.</span></>}
          description="Our chefs rotate the menu every week to keep things exciting — comfort classics, regional specials, and student favourites. No mystery-meat thalis."
        />

        {/* Day picker */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex gap-1 rounded-full bg-paper border border-cream-200 p-1 shadow-soft overflow-x-auto max-w-full">
            {menu.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  dayIdx === i
                    ? 'bg-ink-900 text-cream-50'
                    : 'text-ink-700 hover:bg-cream-100',
                )}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-6 flex justify-center gap-2">
          {[
            { id: 'all',    label: 'All' },
            { id: 'veg',    label: '🌿 Vegetarian' },
            { id: 'nonveg', label: '🍗 Non-veg' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Filter)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors border',
                filter === f.id
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                  : 'border-cream-200 text-ink-500 hover:border-cream-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Main meal card + slot tabs */}
        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          {/* Slot list */}
          <div className="lg:col-span-4 space-y-3">
            {SLOTS.map((s) => {
              const slotMeal = day.meals[s.id]
              const active = s.id === slot
              return (
                <button
                  key={s.id}
                  onClick={() => setSlot(s.id)}
                  className={cn(
                    'group w-full text-left rounded-2xl p-5 border transition-all',
                    active
                      ? 'bg-paper border-saffron-300 shadow-card'
                      : 'bg-paper/60 border-cream-200 hover:border-cream-300',
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="text-eyebrow text-ink-500">{s.label}</span>
                    <span>{s.time}</span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-ink-900">{slotMeal.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone={slotMeal.isVeg ? 'leaf' : 'saffron'}>
                          {slotMeal.isVeg ? 'Veg' : 'Non-veg'}
                        </Badge>
                        {slotMeal.loved && <Badge tone="saffron">❤ Most loved</Badge>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-ink-900">★ {slotMeal.rating}</p>
                      <p className="text-xs text-ink-500">{slotMeal.calories} kcal</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Featured meal */}
          <Card className="lg:col-span-8 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div
                className={cn(
                  'relative min-h-[280px] md:min-h-[460px]',
                  meal.isVeg
                    ? 'bg-gradient-to-br from-leaf-100 via-cream-100 to-saffron-100'
                    : 'bg-gradient-to-br from-saffron-200 via-saffron-100 to-cream-100',
                )}
              >
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-grain opacity-50" aria-hidden />
                    <div className="absolute inset-0 grid place-items-center" aria-hidden>
                      <div className="relative h-56 w-56 rounded-full bg-paper shadow-card">
                        <div
                          className={cn(
                            'absolute inset-6 rounded-full',
                            meal.isVeg
                              ? 'bg-gradient-to-br from-leaf-300 to-leaf-500'
                              : 'bg-gradient-to-br from-saffron-400 to-spice-500',
                          )}
                        />
                        <div className="absolute inset-12 rounded-full bg-paper/80" />
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  {meal.loved && <Badge tone="ink">❤ Most loved</Badge>}
                  <Badge tone="paper">{meal.calories} kcal</Badge>
                </div>
                <div className="absolute bottom-5 right-5 inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1.5 shadow-soft">
                  <span className="text-sm font-semibold text-ink-900">★ {meal.rating}</span>
                  <span className="text-xs text-ink-500">student rating</span>
                </div>
              </div>

              <div className="p-7 sm:p-9 flex flex-col">
                <p className="text-eyebrow">{day.day} · {SLOTS.find((s) => s.id === slot)?.label}</p>
                <h3 className="mt-3 font-display text-3xl lg:text-4xl text-ink-900">{meal.name}</h3>
                <p className="mt-4 text-ink-500 leading-relaxed">{meal.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {meal.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8 grid grid-cols-3 gap-4 border-t border-cream-200">
                  <Stat label="Type" value={meal.isVeg ? 'Vegetarian' : 'Non-veg'} />
                  <Stat label="Calories" value={`${meal.calories} kcal`} />
                  <Stat label="Rating" value={`★ ${meal.rating} / 5`} />
                </div>

                {!compatible && (
                  <p className="mt-4 rounded-xl bg-cream-100 px-3 py-2 text-xs text-ink-500">
                    Doesn't match your filter — but it's on the menu today.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-eyebrow text-ink-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  )
}
