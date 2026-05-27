import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSubscription, type SkipResult } from '@/context/SubscriptionContext'
import {
  SKIP_LIMITS,
  SLOT_LABEL,
  describeCutoff,
  earliestValidDate,
  formatSkipDate,
} from '@/lib/skip'
import type { MealSlot } from '@/types'
import { cn } from '@/lib/cn'

type Tab = 'meal' | 'day'

interface Banner {
  tone: 'success' | 'error'
  text: string
}

const REASON_COPY: Record<Exclude<SkipResult, { ok: true }>['reason'], string> = {
  'not-monthly': 'Skips are only available on monthly plans.',
  'limit-reached': 'You\'ve used all your skips for this billing cycle.',
  'duplicate': 'That meal or day is already marked to skip.',
  'past-date': 'Please pick a date in the future.',
  'cutoff-passed': 'Too late to skip this one — the cutoff has passed.',
  'unknown': 'Something went wrong. Please try again.',
}

export function SkipMealsPage() {
  const {
    sub,
    isMonthly,
    mealSkipsUsed,
    mealSkipsLeft,
    daySkipsUsed,
    daySkipsLeft,
    upcomingMealSkips,
    upcomingDaySkips,
    skipMeal,
    skipDay,
    removeMealSkip,
    removeDaySkip,
  } = useSubscription()

  const [tab, setTab] = useState<Tab>('meal')
  const [slot, setSlot] = useState<MealSlot>('lunch')
  const [banner, setBanner] = useState<Banner | null>(null)

  // Earliest date the user is allowed to pick given the active tab + slot.
  // Recomputes whenever tab or slot changes (e.g., picking dinner relaxes
  // "earliest" to today if it's still morning).
  const minDate = useMemo(
    () => earliestValidDate(tab === 'day' ? undefined : slot),
    [tab, slot],
  )
  const cutoffHint = useMemo(
    () => describeCutoff({ date: minDate, slot: tab === 'day' ? undefined : slot }),
    [tab, slot, minDate],
  )

  const [date, setDate] = useState<string>(minDate)

  // If the active min moves past the currently picked date, bump the date up.
  useEffect(() => {
    if (date < minDate) setDate(minDate)
  }, [minDate, date])

  if (!sub) return null

  const onSkipMeal = async () => {
    const r = await skipMeal(date, slot)
    if (r.ok) {
      setBanner({
        tone: 'success',
        text: `Got it — ${SLOT_LABEL[slot]} on ${formatSkipDate(date)} is skipped. The kitchen has been notified.`,
      })
    } else {
      setBanner({ tone: 'error', text: REASON_COPY[r.reason] })
    }
  }

  const onSkipDay = async () => {
    const r = await skipDay(date)
    if (r.ok) {
      setBanner({
        tone: 'success',
        text: `Done — your full day on ${formatSkipDate(date)} is skipped. We won't prepare any meal that day.`,
      })
    } else {
      setBanner({ tone: 'error', text: REASON_COPY[r.reason] })
    }
  }

  /* --------- Eligibility gate --------------------------------------------- */
  if (!isMonthly) {
    return (
      <AppContainer>
        <PageHeader
          eyebrow="Manage your plan"
          title="Skip a meal or a day"
          description="Tell us when you'll be away — we'll skip cooking and your plan extends by the days you miss."
        />
        <Card className="mt-8 p-8 text-center">
          <div
            aria-hidden
            className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-saffron-100 text-saffron-700"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6m0 3.5h.01" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-2xl text-ink-900">
            Available on monthly plans only
          </h2>
          <p className="mt-2 text-ink-500 max-w-md mx-auto">
            Skip-meal and skip-day are reserved for monthly subscribers. Upgrade to a monthly rhythm to plan around your weekends, college trips and home calls.
          </p>
          <div className="mt-6">
            <Link to="/app/subscription">
              <Button variant="secondary" size="md">Switch to monthly →</Button>
            </Link>
          </div>
        </Card>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Manage your plan"
        title="Skip a meal or a day"
        description="Plan ahead — tell us when you'll be away. Your plan auto-extends by the days you skip."
      />

      {/* Allowance summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <AllowanceCard
          label="Meal skips"
          used={mealSkipsUsed}
          left={mealSkipsLeft}
          total={SKIP_LIMITS.meal}
          tone="saffron"
        />
        <AllowanceCard
          label="Full-day skips"
          used={daySkipsUsed}
          left={daySkipsLeft}
          total={SKIP_LIMITS.day}
          tone="leaf"
        />
      </div>

      {/* Skip form */}
      <Card className="mt-8 p-5 sm:p-8">
        {/* Tabs */}
        <div className="inline-flex w-full sm:w-auto rounded-full bg-cream-100 p-1">
          <TabButton active={tab === 'meal'} onClick={() => { setTab('meal'); setBanner(null) }}>
            Skip one meal
          </TabButton>
          <TabButton active={tab === 'day'} onClick={() => { setTab('day'); setBanner(null) }}>
            Skip a full day
          </TabButton>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-eyebrow text-ink-500" htmlFor="skip-date">
              Date
            </label>
            <input
              id="skip-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => { setDate(e.target.value); setBanner(null) }}
              className={cn(
                'mt-2 w-full rounded-2xl bg-paper border border-cream-300 px-4 py-3',
                'text-ink-900 focus:outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-200',
              )}
            />
            <p className="mt-2 text-xs text-ink-500">{formatSkipDate(date)}</p>
          </div>

          {tab === 'meal' && (
            <div>
              <p className="text-eyebrow text-ink-500">Which meal?</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((s) => {
                  const active = slot === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSlot(s); setBanner(null) }}
                      className={cn(
                        'rounded-2xl border px-3 py-3 text-sm font-medium transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-300',
                        active
                          ? 'bg-ink-900 text-cream-50 border-ink-900 shadow-soft'
                          : 'bg-paper text-ink-700 border-cream-300 hover:border-saffron-400',
                      )}
                    >
                      {SLOT_LABEL[s]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'day' && (
            <div className="rounded-2xl bg-cream-100/70 border border-cream-200 p-4 text-sm text-ink-600">
              <p className="font-medium text-ink-900">All 3 meals will be skipped</p>
              <p className="mt-1">
                Breakfast, lunch and dinner on this date won't be prepared for you.
              </p>
            </div>
          )}
        </div>

        {/* Cutoff rule — kitchen needs lead time */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-saffron-50 border border-saffron-100 p-4 text-sm text-ink-700">
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-ink-900">
              {tab === 'day'
                ? 'Full-day skips need a day\'s notice'
                : `${SLOT_LABEL[slot]} skip — confirm ${cutoffHint}`}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              {tab === 'day'
                ? 'Submit your full-day skip on the day before — earliest available date is already shown.'
                : 'Once the cutoff passes, the kitchen has started prepping and we can\'t pull this one back.'}
            </p>
          </div>
        </div>

        {banner && (
          <div
            role="status"
            className={cn(
              'mt-6 rounded-2xl px-4 py-3 text-sm border',
              banner.tone === 'success'
                ? 'bg-leaf-100 text-leaf-700 border-leaf-200'
                : 'bg-spice-50 text-spice-700 border-spice-200',
            )}
          >
            {banner.text}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={tab === 'meal' ? onSkipMeal : onSkipDay}
            disabled={tab === 'meal' ? mealSkipsLeft === 0 : daySkipsLeft === 0}
          >
            {tab === 'meal' ? 'Confirm meal skip' : 'Confirm full-day skip'}
          </Button>
          <p className="text-xs text-ink-500">
            {tab === 'meal'
              ? `${mealSkipsLeft} of ${SKIP_LIMITS.meal} meal skips left this cycle`
              : `${daySkipsLeft} of ${SKIP_LIMITS.day} day skips left this cycle`}
          </p>
        </div>
      </Card>

      {/* Upcoming */}
      {(upcomingMealSkips.length > 0 || upcomingDaySkips.length > 0) && (
        <Card variant="soft" className="mt-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl text-ink-900">Upcoming skips</h2>
          <p className="mt-1 text-sm text-ink-500">
            Notifications have already been sent to the kitchen — you can pull a skip back if your plans change.
          </p>

          <ul className="mt-5 divide-y divide-cream-200">
            {upcomingDaySkips.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{formatSkipDate(d.date)}</p>
                  <p className="text-xs text-ink-500">Full day · all 3 meals skipped</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone="saffron">Day skip</Badge>
                  <button
                    onClick={() => removeDaySkip(d.id)}
                    className="text-xs font-medium text-ink-500 hover:text-spice-700"
                  >
                    Undo
                  </button>
                </div>
              </li>
            ))}
            {upcomingMealSkips.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">
                    {formatSkipDate(m.date)} · {SLOT_LABEL[m.slot]}
                  </p>
                  <p className="text-xs text-ink-500">One meal · kitchen notified</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone="cream">Meal skip</Badge>
                  <button
                    onClick={() => removeMealSkip(m.id)}
                    className="text-xs font-medium text-ink-500 hover:text-spice-700"
                  >
                    Undo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="mt-8 text-center text-xs text-ink-500">
        Skip limits reset at the start of every monthly billing cycle.
      </p>
    </AppContainer>
  )
}

function AllowanceCard({
  label,
  used,
  left,
  total,
  tone,
}: {
  label: string
  used: number
  left: number
  total: number
  tone: 'saffron' | 'leaf'
}) {
  const pct = Math.round((used / total) * 100)
  const exhausted = left === 0
  return (
    <Card variant="soft" className="p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-eyebrow text-ink-500">{label}</p>
        <Badge tone={exhausted ? 'cream' : tone}>
          {exhausted ? 'Used up' : `${left} left`}
        </Badge>
      </div>
      <p className="mt-2 font-display text-3xl text-ink-900">
        {used} <span className="text-ink-400 text-2xl">/ {total}</span>
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-cream-200 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            tone === 'saffron' ? 'bg-saffron-500' : 'bg-leaf-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-ink-500">used this billing cycle</p>
    </Card>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 sm:flex-initial rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition-all whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
        active
          ? 'bg-ink-900 text-cream-50 shadow-soft'
          : 'text-ink-600 hover:text-ink-900',
      )}
    >
      {children}
    </button>
  )
}
