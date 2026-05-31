import { useNavigate } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { greeting, inr } from '@/lib/format'
import { PLANS } from '@/data/plans'
import { SKIP_LIMITS, SLOT_LABEL, formatSkipDate } from '@/lib/skip'
import type { MealSlot } from '@/types'
import { cn } from '@/lib/cn'

const SLOT_META: Record<MealSlot, { label: string; time: string; icon: string }> = {
  breakfast: { label: 'Breakfast', time: '7 – 9 AM',     icon: '🌅' },
  lunch:     { label: 'Lunch',     time: '12:30 – 2 PM', icon: '🍛' },
  dinner:    { label: 'Dinner',    time: '7:30 – 9 PM',  icon: '🌙' },
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    sub,
    plan,
    dayNumber,
    mealsRemaining,
    todayDay,
    nextSlot,
    isMonthly,
    mealSkipsLeft,
    daySkipsLeft,
    upcomingMealSkips,
    upcomingDaySkips,
  } = useSubscription()

  if (!sub || !plan) return null

  const today = sub.today
  const totalSavedSoFar = plan.savingPerMeal * sub.mealsServed

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

  return (
    <AppContainer>
      {/* Editorial masthead — date / live indicator */}
      <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.2em] uppercase text-ink-400">
        <span>Today &mdash; {todayLabel}</span>
        <span className="inline-flex items-center gap-2 text-leaf-700">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf-500 animate-pulse-dot" />
          Live
        </span>
      </div>
      <div className="mt-4 hairline" />

      {/* Greeting block — editorial split */}
      <div className="mt-8 grid lg:grid-cols-12 gap-6 lg:gap-10 items-end">
        <div className="lg:col-span-8">
          <p className="text-eyebrow text-saffron-600">{greeting()}</p>
          <h1 className="mt-2 text-display text-4xl sm:text-5xl lg:text-[3.75rem] tracking-[-0.03em] leading-[1.02] text-ink-900">
            {user?.name?.split(' ')[0]},
            <br />
            <span className="italic font-light text-saffron-600">
              {nextSlot
                ? `${SLOT_META[nextSlot].label.toLowerCase()} is up next.`
                : 'all meals served.'}
            </span>
          </h1>
          {nextSlot && (
            <p className="mt-4 text-[15px] sm:text-base text-ink-500 leading-relaxed max-w-xl">
              <span className="font-display italic text-ink-700">
                &ldquo;{todayDay.meals[nextSlot].name}&rdquo;
              </span>
              {' '}— {todayDay.meals[nextSlot].description}
            </p>
          )}
        </div>

        {/* Plan progress capsule */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-paper border border-cream-200 p-5 ring-inset-warm">
            <p className="text-eyebrow text-ink-500">This cycle</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-editorial text-4xl text-ink-900">{dayNumber}</span>
              <span className="text-sm text-ink-400">/ 30</span>
            </p>
            <p className="caption text-xs text-ink-500">day of your plan</p>
            <div className="mt-3 h-1.5 rounded-full bg-cream-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron-400 to-saffron-500"
                style={{ width: `${Math.min(100, (sub.mealsServed / sub.totalMeals) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between text-xs text-ink-500">
              <span>{sub.mealsServed} served</span>
              <span><span className="font-semibold text-ink-900">{mealsRemaining}</span> left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's three meals — editorial row, hairline-separated */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-eyebrow text-ink-500">Today's three meals</p>
            <h2 className="mt-1.5 text-display text-2xl tracking-tight text-ink-900">
              Breakfast, lunch, dinner.
            </h2>
          </div>
          <span className="text-chapter text-base text-saffron-500 tabular-nums hidden sm:inline">
            Chapter 01
          </span>
        </div>

        <div className="hairline" />

        <div className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-cream-200">
          {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot, i) => {
            const meal = todayDay.meals[slot]
            const status = today[slot]
            const meta = SLOT_META[slot]
            const isNext = slot === nextSlot
            const isServed = status === 'served'
            const isSkipped = status === 'skipped'
            return (
              <article
                key={slot}
                className={cn(
                  'relative p-6 transition-colors duration-500 border-b border-cream-200 sm:border-b-0',
                  isNext && 'bg-saffron-50/60',
                  isServed && 'opacity-60',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-chapter text-xl text-saffron-500 tabular-nums">
                      0{i + 1}
                    </p>
                    <p className="mt-2 text-eyebrow text-ink-500">{meta.label}</p>
                    <p className="caption text-xs text-ink-400 mt-0.5">{meta.time}</p>
                  </div>
                  {isNext && <Badge tone="saffron" dot>Up next</Badge>}
                  {isServed && <Badge tone="leaf">✓ Served</Badge>}
                  {isSkipped && <Badge tone="cream">Skipped</Badge>}
                </div>

                <h3 className="mt-5 text-display text-xl tracking-tight text-ink-900 leading-tight">
                  {meal.name}
                </h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed line-clamp-2">
                  {meal.description}
                </p>

                <div className="mt-5 pt-4 border-t border-cream-200/70 flex items-center justify-between text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn('h-1.5 w-1.5 rounded-full', meal.isVeg ? 'bg-leaf-500' : 'bg-saffron-500')} />
                    {meal.isVeg ? 'Veg' : 'Non-veg'}
                    <span className="text-ink-300">·</span>
                    {meal.calories} kcal
                  </span>
                  <span className="font-semibold text-ink-900 inline-flex items-center gap-1">
                    <span className="text-saffron-500">★</span>{meal.rating}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
        <div className="hairline" />
      </section>

      {/* Editorial figure sheet */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-eyebrow text-ink-500">By the numbers</p>
            <h2 className="mt-1.5 text-display text-2xl tracking-tight text-ink-900">
              Your plan, at a glance.
            </h2>
          </div>
          <span className="text-chapter text-base text-saffron-500 tabular-nums hidden sm:inline">
            Chapter 02
          </span>
        </div>

        <div className="hairline" />
        <Figure label="Day" figure={`${dayNumber}`} unit="/ 30" hint="of this cycle" />
        <Figure label="Meals served" figure={`${sub.mealsServed}`} unit={`/ ${sub.totalMeals}`} hint="auto-extends if you skip" />
        <Figure label="Meals remaining" figure={`${mealsRemaining}`} unit="meals" hint="auto-extends if you skip" tone="saffron" />
        <Figure
          label="Saved this cycle"
          figure={inr(totalSavedSoFar).replace('₹', '')}
          unit="₹"
          hint={plan.savingPerMonth > 0 ? `Up to ${inr(plan.savingPerMonth)} / mo` : 'Solo — bring friends to save'}
          tone="leaf"
          unitLeading
        />
        <div className="hairline" />
      </section>

      {/* Calls to action — kept as cards, but editorial */}
      <section className="mt-14 grid gap-5 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-ink-900 text-cream-50 p-6 sm:p-7 lift-card">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-saffron-500/30 blur-2xl animate-breathe"
          />
          <div className="relative">
            <p className="text-eyebrow text-saffron-300">QR meal pass</p>
            <h3 className="mt-2 text-display text-2xl sm:text-3xl tracking-tight">
              Show, scan, <span className="italic font-light">done.</span>
            </h3>
            <p className="mt-3 caption text-cream-50/70 max-w-xs">
              Your delivery person scans once — one meal off your plan, automatic.
            </p>
            <div className="mt-5">
              <Button variant="secondary" size="md" onClick={() => navigate('/app/qr')}>
                Open QR pass →
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="soft" className="p-6 sm:p-7 lift-card">
          <p className="text-eyebrow">This week's menu</p>
          <h3 className="mt-2 text-display text-2xl sm:text-3xl tracking-tight text-ink-900">
            Plan <span className="italic font-light text-saffron-600">ahead.</span>
          </h3>
          <p className="mt-3 caption text-ink-500 max-w-xs">
            Browse 21 meals across the week. Flag favourites, rate what you ate.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="md" onClick={() => navigate('/app/menu')}>Browse menu →</Button>
            <Button variant="ghost" size="md" onClick={() => navigate('/app/subscription')}>Manage plan</Button>
          </div>
        </Card>
      </section>

      {/* Skip allowance — monthly subscribers only */}
      {isMonthly && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-eyebrow text-ink-500">Plan around your week</p>
              <h2 className="mt-1.5 text-display text-2xl tracking-tight text-ink-900">
                Skip <span className="italic font-light text-saffron-600">allowance.</span>
              </h2>
              <p className="mt-2 caption text-ink-500 max-w-md">
                Going home this weekend? Mark the meals or days you'll be away —
                kitchen stops cooking, your plan extends.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/app/skip')}
            >
              Skip a meal →
            </Button>
          </div>

          <div className="hairline" />
          <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-cream-200">
            <SkipMeter
              label="Meal skips"
              left={mealSkipsLeft}
              total={SKIP_LIMITS.meal}
              tone="saffron"
            />
            <SkipMeter
              label="Full-day skips"
              left={daySkipsLeft}
              total={SKIP_LIMITS.day}
              tone="leaf"
            />
          </div>
          <div className="hairline" />

          {(upcomingDaySkips.length > 0 || upcomingMealSkips.length > 0) && (
            <div className="mt-6">
              <p className="text-eyebrow text-ink-500">Upcoming skips</p>
              <ul className="mt-3 divide-y divide-cream-200/70">
                {upcomingDaySkips.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-ink-900 truncate">
                      <span className="font-medium">{formatSkipDate(d.date)}</span>
                      <span className="caption text-ink-500 ml-1.5">full day</span>
                    </span>
                    <Badge tone="saffron">Day skip</Badge>
                  </li>
                ))}
                {upcomingMealSkips.slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-ink-900 truncate">
                      <span className="font-medium">{formatSkipDate(m.date)}</span>
                      <span className="caption text-ink-500 ml-1.5">{SLOT_LABEL[m.slot]}</span>
                    </span>
                    <Badge tone="cream">Meal skip</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Group strip — editorial */}
      {plan.id !== 'solo' && (() => {
        const needed = Math.max(0, plan.groupMin - sub.groupSize)
        const pct = Math.min(100, Math.round((sub.groupSize / plan.groupMin) * 100))
        const unlocked = needed === 0
        return (
          <section className="mt-14 rounded-2xl bg-saffron-50/40 border border-saffron-200 p-6 sm:p-7 ring-inset-warm">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-eyebrow text-saffron-700">Your group</p>
                <p className="mt-2 text-display text-xl sm:text-2xl text-ink-900 tracking-tight">
                  {sub.groupSize} of {plan.groupMin} {sub.groupSize === 1 ? 'member' : 'members'}
                  <span className="mx-2 text-ink-300">·</span>
                  <span className="font-mono text-saffron-700">{sub.groupCode}</span>
                </p>
                <p className="mt-2 caption text-ink-500">
                  {unlocked
                    ? <>Full rate unlocked — you&apos;re saving ₹{plan.savingPerMeal} per meal.</>
                    : <>Add <span className="not-italic font-semibold text-ink-900">{needed} more</span> on the same code to unlock the full ₹{plan.savingPerMeal} / meal saving.</>}
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigator.clipboard?.writeText(sub.groupCode)}
              >
                Copy code
              </Button>
            </div>
            {!unlocked && (
              <div className="mt-5 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-saffron-400 to-saffron-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            )}
          </section>
        )
      })()}

      {plan.id === 'solo' && (
        <section className="mt-14 rounded-2xl border border-cream-300 p-6 sm:p-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-eyebrow text-ink-500">Want to save more?</p>
            <p className="mt-2 text-display text-xl sm:text-2xl text-ink-900 tracking-tight">
              Switch to Squad —
              {' '}
              <span className="italic font-light text-saffron-600">
                save {inr(PLANS.find((p) => p.id === 'squad')!.savingPerMonth)} / month
              </span>
            </p>
            <p className="mt-2 caption text-ink-500">
              Get 5 roommates on the same code, drop to ₹69 / meal. We&apos;ll handle the rest.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/subscription')}
          >
            Upgrade plan →
          </Button>
        </section>
      )}
    </AppContainer>
  )
}

function Figure({
  label,
  figure,
  unit,
  hint,
  tone,
  unitLeading,
}: {
  label: string
  figure: string
  unit: string
  hint?: string
  tone?: 'saffron' | 'leaf'
  unitLeading?: boolean
}) {
  const colorClass =
    tone === 'saffron' ? 'text-saffron-700'
    : tone === 'leaf' ? 'text-leaf-700'
    : 'text-ink-900'
  return (
    <div className="group flex items-baseline justify-between gap-6 py-5 border-b border-cream-200/70 transition-colors duration-300 hover:bg-cream-50/60">
      <div className="flex items-baseline gap-3 min-w-0">
        <p className="text-eyebrow text-ink-500 shrink-0">{label}</p>
        {hint && <p className="caption text-ink-400 truncate">{hint}</p>}
      </div>
      <p className="flex items-baseline gap-1 shrink-0">
        {unitLeading && (
          <span className="text-sm text-ink-400 font-medium">{unit}</span>
        )}
        <span className={cn('text-editorial text-3xl sm:text-4xl', colorClass)}>
          {figure}
        </span>
        {!unitLeading && (
          <span className="text-sm text-ink-400 font-medium">{unit}</span>
        )}
      </p>
    </div>
  )
}

function SkipMeter({
  label,
  left,
  total,
  tone,
}: {
  label: string
  left: number
  total: number
  tone: 'saffron' | 'leaf'
}) {
  const used = total - left
  const pct = Math.round((used / total) * 100)
  return (
    <div className="p-6 transition-colors duration-300 hover:bg-cream-50/60">
      <div className="flex items-baseline justify-between">
        <p className="text-eyebrow text-ink-500">{label}</p>
        <p className="caption text-xs text-ink-500">
          <span className="not-italic font-semibold text-ink-900">{left}</span> of {total} left
        </p>
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className={cn(
          'text-editorial text-4xl',
          tone === 'saffron' ? 'text-saffron-700' : 'text-leaf-700',
        )}>
          {used}
        </span>
        <span className="text-sm text-ink-400 font-medium">/ {total} used</span>
      </p>
      <div className="mt-3 h-1 rounded-full bg-cream-100 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-700',
            tone === 'saffron' ? 'bg-gradient-to-r from-saffron-400 to-saffron-500' : 'bg-gradient-to-r from-leaf-500 to-leaf-700',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
