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
  breakfast: { label: 'Breakfast', time: '7 – 9 AM', icon: '🌅' },
  lunch:     { label: 'Lunch',     time: '12:30 – 2 PM', icon: '🍛' },
  dinner:    { label: 'Dinner',    time: '7:30 – 9 PM', icon: '🌙' },
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

  return (
    <AppContainer>
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          <h1 className="mt-2 text-display text-3xl sm:text-4xl text-ink-900">
            {greeting()}, <span className="text-saffron-600">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-1 text-ink-500">
            {nextSlot
              ? <>Your <span className="font-medium text-ink-900">{SLOT_META[nextSlot].label.toLowerCase()}</span> is up next — {todayDay.meals[nextSlot].name}.</>
              : 'All meals served for today. See you tomorrow.'}
          </p>
        </div>
      </div>

      {/* Today's meal cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot) => {
          const meal = todayDay.meals[slot]
          const status = today[slot]
          const meta = SLOT_META[slot]
          return (
            <Card
              key={slot}
              className={cn(
                'relative overflow-hidden p-5',
                status === 'served' && 'opacity-70',
                slot === nextSlot && 'ring-2 ring-saffron-300 border-saffron-300',
              )}
            >
              {status === 'served' && (
                <div className="absolute right-4 top-4">
                  <Badge tone="leaf">✓ Served</Badge>
                </div>
              )}
              {status === 'skipped' && (
                <div className="absolute right-4 top-4">
                  <Badge tone="cream">Skipped</Badge>
                </div>
              )}
              {slot === nextSlot && (
                <div className="absolute right-4 top-4">
                  <Badge tone="saffron">Up next</Badge>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{meta.icon}</span>
                <div>
                  <p className="text-eyebrow text-ink-500">{meta.label}</p>
                  <p className="text-xs text-ink-500">{meta.time}</p>
                </div>
              </div>

              <h3 className="mt-4 font-display text-xl text-ink-900">{meal.name}</h3>
              <p className="mt-1 text-sm text-ink-500 line-clamp-2">{meal.description}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className={cn('h-1.5 w-1.5 rounded-full', meal.isVeg ? 'bg-leaf-500' : 'bg-saffron-500')} />
                    {meal.isVeg ? 'Veg' : 'Non-veg'}
                  </span>
                  <span>{meal.calories} kcal</span>
                </div>
                <span className="font-semibold text-ink-900">★ {meal.rating}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Day" value={`${dayNumber} / 30`} hint="of this cycle" />
        <StatCard label="Meals served" value={`${sub.mealsServed}`} hint={`of ${sub.totalMeals}`} />
        <StatCard label="Meals remaining" value={`${mealsRemaining}`} hint="auto-extends if you skip" tone="saffron" />
        <StatCard
          label="Saved this cycle"
          value={inr(totalSavedSoFar)}
          hint={plan.savingPerMonth > 0 ? `Up to ${inr(plan.savingPerMonth)}/mo` : 'Solo — bring friends to save'}
          tone="leaf"
        />
      </div>

      {/* CTA strip */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-ink-900 text-cream-50 p-6">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-saffron-500/30 blur-2xl"
          />
          <div className="relative">
            <p className="text-eyebrow text-saffron-300">QR meal pass</p>
            <h3 className="mt-2 font-display text-2xl">Show, scan, done.</h3>
            <p className="mt-2 text-sm text-cream-50/70 max-w-xs">
              Your delivery person scans once — one meal comes off your plan automatically.
            </p>
            <div className="mt-5">
              <Button variant="secondary" size="md" onClick={() => navigate('/app/qr')}>
                Open QR pass →
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="soft" className="p-6">
          <p className="text-eyebrow">This week's menu</p>
          <h3 className="mt-2 font-display text-2xl text-ink-900">Plan ahead</h3>
          <p className="mt-2 text-sm text-ink-500 max-w-xs">
            Browse 21 meals across the week. Flag favourites, rate what you ate.
          </p>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" size="md" onClick={() => navigate('/app/menu')}>Browse menu →</Button>
            <Button variant="ghost" size="md" onClick={() => navigate('/app/subscription')}>Manage plan</Button>
          </div>
        </Card>
      </div>

      {/* Skip allowance — monthly subscribers only */}
      {isMonthly && (
        <Card variant="soft" className="mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-eyebrow">Plan around your week</p>
              <h3 className="mt-1 font-display text-2xl text-ink-900">Skip allowance</h3>
              <p className="mt-1 text-sm text-ink-500 max-w-md">
                Going home this weekend? Mark the meals or days you'll be away — kitchen stops cooking, your plan extends.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={() => navigate('/app/skip')}>
              Skip a meal →
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

          {(upcomingDaySkips.length > 0 || upcomingMealSkips.length > 0) && (
            <div className="mt-5 rounded-2xl bg-paper border border-cream-200 p-4">
              <p className="text-eyebrow text-ink-500">Upcoming</p>
              <ul className="mt-3 space-y-2 text-sm">
                {upcomingDaySkips.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <span className="text-ink-900 truncate">
                      <span className="font-medium">{formatSkipDate(d.date)}</span>
                      <span className="text-ink-500"> · full day</span>
                    </span>
                    <Badge tone="saffron">Day skip</Badge>
                  </li>
                ))}
                {upcomingMealSkips.slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3">
                    <span className="text-ink-900 truncate">
                      <span className="font-medium">{formatSkipDate(m.date)}</span>
                      <span className="text-ink-500"> · {SLOT_LABEL[m.slot]}</span>
                    </span>
                    <Badge tone="cream">Meal skip</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Group strip */}
      {plan.id !== 'solo' && (() => {
        const needed = Math.max(0, plan.groupMin - sub.groupSize)
        const pct = Math.min(100, Math.round((sub.groupSize / plan.groupMin) * 100))
        const unlocked = needed === 0
        return (
          <Card variant="outline" className="mt-6 p-6 bg-saffron-50/40 border-saffron-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow text-saffron-700">Your group</p>
                <p className="mt-1 font-display text-xl text-ink-900">
                  {sub.groupSize} of {plan.groupMin} {sub.groupSize === 1 ? 'member' : 'members'} · code{' '}
                  <span className="font-mono text-saffron-700">{sub.groupCode}</span>
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {unlocked
                    ? <>Full rate unlocked — you're saving ₹{plan.savingPerMeal} per meal.</>
                    : <>Add <span className="font-semibold text-ink-900">{needed} more</span> on the same code to unlock the full ₹{plan.savingPerMeal}/meal saving.</>}
                </p>
              </div>
              <Button variant="outline" size="md" onClick={() => navigator.clipboard?.writeText(sub.groupCode)}>
                Copy code
              </Button>
            </div>
            {!unlocked && (
              <div className="mt-4 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-saffron-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
          </Card>
        )
      })()}

      {plan.id === 'solo' && (
        <Card variant="outline" className="mt-6 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-eyebrow">Want to save more?</p>
            <p className="mt-1 font-display text-xl text-ink-900">
              Switch to Squad — save {inr(PLANS.find((p) => p.id === 'squad')!.savingPerMonth)} / month
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Get 5 roommates on the same code, drop to ₹69/meal. We'll handle the rest.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/app/subscription')}>
            Upgrade plan →
          </Button>
        </Card>
      )}
    </AppContainer>
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
    <div className="rounded-2xl bg-paper border border-cream-200 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-eyebrow text-ink-500">{label}</p>
        <p className="text-xs text-ink-500">
          <span className="font-semibold text-ink-900">{left}</span> of {total} left
        </p>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-cream-100 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            tone === 'saffron' ? 'bg-saffron-500' : 'bg-leaf-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'saffron' | 'leaf'
}) {
  return (
    <Card variant="soft" className="p-5">
      <p className="text-eyebrow text-ink-500">{label}</p>
      <p
        className={cn(
          'mt-2 font-display text-3xl',
          tone === 'saffron' && 'text-saffron-700',
          tone === 'leaf' && 'text-leaf-700',
          !tone && 'text-ink-900',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </Card>
  )
}
