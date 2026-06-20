import { useState } from 'react'
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

// Monday-based weekday index — the WEEKLY_MENU array starts on Monday.
function todayIdx(): number {
  return (new Date().getDay() + 6) % 7
}

// Default to the slot that's most relevant for the current time of day, so
// that a visitor arriving at lunchtime sees today's lunch up first instead
// of a hard-coded slot.
function currentSlot(): MealSlot {
  const h = new Date().getHours()
  if (h < 10) return 'breakfast'
  if (h < 16) return 'lunch'
  return 'dinner'
}

export function WeeklyMenu() {
  const { menu } = useMenu()
  const [dayIdx, setDayIdx] = useState(todayIdx)
  const [slot, setSlot] = useState<MealSlot>(currentSlot)

  const day = menu[dayIdx]
  const meal = day.meals[slot]

  return (
    <Section id="menu" className="bg-mist relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Weekly rotating menu"
          title={<>Real food you&apos;d <span className="italic font-light text-saffron-600">actually look forward to.</span></>}
          description="Our chefs rotate the menu every week to keep things exciting — comfort classics, regional specials, and student favourites. No mystery-meat thalis."
        />

        {/* Day picker — horizontally scrollable on mobile, edge-to-edge so all
            7 days fit without cramping. Hides scrollbar but keeps swipe.
            Defaults to today on load (todayIdx) so a visitor doesn't have to
            hunt for the current day. */}
        <div className="mt-10 sm:mt-14 -mx-4 sm:mx-0 px-4 sm:px-0 sm:flex sm:justify-center overflow-x-auto">
          <div className="inline-flex gap-1 rounded-full bg-paper border border-cream-200 p-1 sm:p-1.5 shadow-soft ring-inset-warm">
            {menu.map((d, i) => {
              const isToday = i === todayIdx()
              return (
                <button
                  key={d.day}
                  onClick={() => setDayIdx(i)}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 sm:px-5 py-2 text-sm font-medium transition-all duration-300',
                    dayIdx === i
                      ? 'bg-ink-900 text-cream-50 shadow-soft scale-105'
                      : 'text-ink-700 active:bg-cream-100 hover:bg-cream-100',
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {d.short}
                    {isToday && dayIdx !== i && (
                      <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse-dot" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main meal card + slot tabs */}
        <div className="mt-8 sm:mt-12 grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Slot list — each slot is a tap-to-expand row. The chevron makes
              the interactivity legible at a glance: closed slots show a down
              chevron (tap to see details), the active slot shows it rotated
              and the meal panel on the right reflects the chosen slot. */}
          <div className="lg:col-span-4 space-y-2 sm:space-y-3 order-2 lg:order-1">
            {SLOTS.map((s) => {
              const slotMeal = day.meals[s.id]
              const active = s.id === slot
              return (
                <button
                  key={s.id}
                  onClick={() => setSlot(s.id)}
                  aria-expanded={active}
                  className={cn(
                    'group w-full text-left rounded-2xl p-4 sm:p-5 border transition-all duration-400 ease-out active:scale-[0.98]',
                    active
                      ? 'bg-paper border-saffron-300 shadow-card ring-1 ring-saffron-200/50'
                      : 'bg-paper/60 border-cream-200 hover:border-cream-300 hover:bg-paper hover:-translate-y-0.5 hover:shadow-soft',
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="text-eyebrow text-ink-500">{s.label}</span>
                    <span>{s.time}</span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base sm:text-lg text-ink-900 tracking-tight truncate">{slotMeal.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone={slotMeal.isVeg ? 'leaf' : 'saffron'} dot>
                          {slotMeal.isVeg ? 'Veg' : 'Non-veg'}
                        </Badge>
                        {slotMeal.loved && <Badge tone="saffron">❤ Most loved</Badge>}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900 inline-flex items-center gap-1">
                          <span className="text-saffron-500">★</span>{slotMeal.rating}
                        </p>
                        <p className="text-xs text-ink-500">{slotMeal.calories} kcal</p>
                      </div>
                      {/* Expand chevron — rotates when the slot is active so
                          the user feels the row "open" into the detail panel.
                          Sized to match other affordances; not focusable on
                          its own (the parent button handles activation). */}
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 grid h-7 w-7 place-items-center rounded-full transition-all duration-300 shrink-0',
                          active
                            ? 'bg-saffron-500 text-cream-50 rotate-180 shadow-soft'
                            : 'bg-cream-100 text-ink-500 group-hover:bg-cream-200',
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Featured meal */}
          <Card className="lg:col-span-8 overflow-hidden p-0 order-1 lg:order-2">
            <div className="grid md:grid-cols-2">
              <div
                className={cn(
                  // Mobile: 4:3 aspect for a balanced thumbnail; tablet+: full
                  // panel height so the image fills the card alongside copy.
                  'relative aspect-[4/3] md:aspect-auto md:min-h-[500px] img-reveal',
                  meal.isVeg
                    ? 'bg-gradient-to-br from-leaf-100 via-cream-100 to-saffron-100'
                    : 'bg-gradient-to-br from-saffron-200 via-saffron-100 to-cream-100',
                )}
              >
                {meal.imageUrl ? (
                  <img
                    key={meal.imageUrl}
                    src={meal.imageUrl}
                    alt={meal.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover animate-reveal"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-grain opacity-50" aria-hidden />
                    <div className="absolute inset-0 grid place-items-center" aria-hidden>
                      <div className="relative h-56 w-56 rounded-full bg-paper shadow-card animate-float">
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
                {/* Cinematic vignette */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink-900/30 via-transparent to-transparent"
                />
                <div className="absolute left-4 top-4 sm:left-5 sm:top-5 flex flex-wrap gap-1.5 sm:gap-2 z-10">
                  {meal.loved && <Badge tone="ink">❤ Most loved</Badge>}
                  <Badge tone="paper">{meal.calories} kcal</Badge>
                </div>
                <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-soft backdrop-blur-sm">
                  <span className="text-saffron-500 text-sm">★</span>
                  <span className="text-sm font-semibold text-ink-900">{meal.rating}</span>
                  <span className="text-[11px] sm:text-xs text-ink-500">rating</span>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-10 flex flex-col">
                <p className="text-eyebrow">{day.day} · {SLOTS.find((s) => s.id === slot)?.label}</p>
                <h3 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl lg:text-4xl text-ink-900 tracking-tight leading-tight">{meal.name}</h3>
                <p className="mt-3 sm:mt-4 text-[14px] sm:text-base text-ink-500 leading-relaxed">{meal.description}</p>

                <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
                  {meal.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-700 ring-1 ring-cream-200/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 sm:mt-auto sm:pt-8 pt-5 grid grid-cols-3 gap-3 sm:gap-4 border-t border-cream-200">
                  <Stat label="Type" value={meal.isVeg ? 'Vegetarian' : 'Non-veg'} />
                  <Stat label="Calories" value={`${meal.calories} kcal`} />
                  <Stat label="Rating" value={`★ ${meal.rating} / 5`} />
                </div>
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
      <p className="mt-1.5 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  )
}
