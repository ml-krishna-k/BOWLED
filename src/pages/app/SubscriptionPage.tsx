import { useMemo, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { PaymentFlow } from '@/components/app/PaymentFlow'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useSubscription } from '@/context/SubscriptionContext'
import { useAuth } from '@/context/AuthContext'
import { PLANS, BILLING_CYCLES, priceFor, mealsFor, pricePerMealFor } from '@/data/plans'
import { lookupGroup, type GroupPreview } from '@/lib/group'
import { ApiError } from '@/lib/api'
import { inr } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Plan, Subscription } from '@/types'

type BillingCycleId = Subscription['billingCycleId']

export function SubscriptionPage() {
  const { sub, paymentInstructions, plan, dayNumber, mealsRemaining, pause, resume } = useSubscription()
  const [showPauseModal, setShowPauseModal] = useState(false)

  // No sub yet → onboarding (pick plan / join group)
  if (!sub) return <Onboarding />

  // Sub in pending_payment → show UPI QR + screenshot upload flow
  if (sub.status === 'pending_payment' && paymentInstructions) {
    return (
      <AppContainer>
        <PageHeader
          eyebrow="Subscription"
          chapter="Payment"
          title={<>Complete your <span className="italic font-light text-saffron-600">payment.</span></>}
          description={`${PLANS.find((p) => p.id === sub.planId)?.name ?? sub.planId} plan · ${BILLING_CYCLES.find((c) => c.id === sub.billingCycleId)?.shortLabel ?? sub.billingCycleId}`}
        />
        <div className="mt-10">
          <PaymentFlow instructions={paymentInstructions} />
        </div>
      </AppContainer>
    )
  }

  // Sub expired → "renew" CTA reusing the Onboarding flow
  if (sub.status === 'expired') {
    return <Onboarding expiredNotice />
  }

  if (!plan) return null

  const pctServed = (sub.mealsServed / sub.totalMeals) * 100
  const paused = !!sub.pause

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Your subscription"
        chapter="Plan"
        title={<>{plan.name} <span className="italic font-light text-saffron-600">plan.</span></>}
        description={`${plan.groupSize} · ₹${plan.pricePerMeal} / meal · ${plan.meals} meals over 30 days.`}
        action={
          paused ? (
            <Button variant="primary" size="md" onClick={resume}>Resume now</Button>
          ) : (
            <Button variant="outline" size="md" onClick={() => setShowPauseModal(true)}>
              Pause subscription
            </Button>
          )
        }
      />

      {/* Status & progress — editorial */}
      <div className="mt-10 grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            {plan.recommended && <Badge tone="ink">Recommended</Badge>}
            {paused ? <Badge tone="saffron" dot>Paused</Badge> : <Badge tone="leaf" dot>Active</Badge>}
            <Badge tone="cream">Day {dayNumber} of 30</Badge>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <p className="text-eyebrow text-ink-500">Plan progress</p>
              <p className="caption text-xs text-ink-500">
                <span className="not-italic font-semibold text-ink-900">{Math.round(pctServed)}%</span> complete
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron-400 to-saffron-500 transition-all duration-700"
                style={{ width: `${Math.min(100, pctServed)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-500">
              <span>{sub.mealsServed} served</span>
              <span>{mealsRemaining} remaining</span>
            </div>
          </div>

          {plan.id !== 'solo' && (
            <div className="rounded-2xl bg-saffron-50/60 border border-saffron-200 p-5 ring-inset-warm">
              <p className="text-eyebrow text-saffron-700">Group code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-mono text-2xl text-ink-900 tracking-wide">{sub.groupCode}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard?.writeText(sub.groupCode)}
                >
                  Copy
                </Button>
              </div>
              <p className="mt-2 caption text-ink-500">
                {sub.groupSize} members in this group. New joiners using this code get the ₹{plan.pricePerMeal} / meal rate automatically.
              </p>
            </div>
          )}
        </div>

        {/* Editorial billing receipt */}
        <div className="lg:col-span-5">
          <p className="text-eyebrow text-ink-500">This cycle</p>
          <div className="mt-3 hairline" />
          <Row label="Meals" value={`${sub.totalMeals}`} />
          <Row label="Per meal" value={inr(plan.pricePerMeal)} />
          {plan.savingPerMeal > 0 && (
            <Row label="Group discount" value={`− ${inr(plan.savingPerMeal)} / meal`} tone="leaf" />
          )}
          <Row label="Delivery" value="Free" tone="leaf" />
          <div className="hairline" />
          <div className="flex items-baseline justify-between py-5">
            <span className="text-eyebrow text-ink-500">Paid this cycle</span>
            <span className="text-editorial text-3xl sm:text-4xl text-ink-900">
              {inr(plan.monthlyPrice)}
            </span>
          </div>
          {plan.savingPerMonth > 0 && (
            <p className="caption text-leaf-700">
              <span className="not-italic font-semibold">Saved {inr(plan.savingPerMonth)}</span> vs Solo
            </p>
          )}
        </div>
      </div>

      {/* Pause modal */}
      {showPauseModal && (
        <PauseModal
          onClose={() => setShowPauseModal(false)}
          onConfirm={(from, to) => {
            pause(from, to)
            setShowPauseModal(false)
          }}
        />
      )}
    </AppContainer>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'leaf'
}) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-cream-200/70 text-sm">
      <span className="text-ink-500">{label}</span>
      <span
        className={cn(
          'font-medium',
          tone === 'leaf' ? 'text-leaf-700' : 'text-ink-900',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Onboarding — shown when the logged-in user has no subscription yet.
 * AppShell auto-redirects them here from any in-app route.
 * ------------------------------------------------------------------------- */
function Onboarding({ expiredNotice = false }: { expiredNotice?: boolean } = {}) {
  const { subscribe, reset } = useSubscription()
  const { user } = useAuth()

  const [mode, setMode] = useState<'new' | 'join'>('new')

  // New-plan state. Plan starts unselected so the CTA visibly switches to
  // the saffron/white "active" theme the moment the user picks one — clear
  // feedback that "this is the plan you're buying".
  const [planId, setPlanId] = useState<Plan['id'] | null>(null)
  const [cycleId, setCycleId] = useState<BillingCycleId>('monthly-31')

  // Group-join state
  const [joinCode, setJoinCode] = useState('')
  const [joinPreview, setJoinPreview] = useState<GroupPreview | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinLooking, setJoinLooking] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const cycle = useMemo(() => BILLING_CYCLES.find((c) => c.id === cycleId)!, [cycleId])
  const selectedPlan = useMemo(
    () => (planId ? PLANS.find((p) => p.id === planId) ?? null : null),
    [planId],
  )
  const previewPlan = joinPreview ? PLANS.find((p) => p.id === joinPreview.planId) : null

  async function verifyGroup() {
    const code = joinCode.trim()
    if (code.length < 3) { setJoinError('Enter the full code'); return }
    setJoinLooking(true)
    setJoinError(null)
    try {
      const g = await lookupGroup(code)
      setJoinPreview(g)
    } catch (err) {
      setJoinPreview(null)
      setJoinError(err instanceof ApiError && err.status === 404
        ? 'No group with that code. Double-check with your friend.'
        : (err instanceof Error ? err.message : 'Lookup failed'))
    } finally {
      setJoinLooking(false)
    }
  }

  async function start() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (mode === 'join') {
        // Joiners don't pay — the originator already covered the group.
        if (!joinPreview) { setSubmitError('Verify the group code first'); return }
        await subscribe(joinPreview.planId, joinPreview.groupCode, undefined, joinPreview.billingCycleId)
      } else {
        if (!planId) { setSubmitError('Pick a plan to continue'); return }
        // New-plan flow → subscription is created in `pending_payment`
        // status; SubscriptionPage detects that and renders <PaymentFlow />.
        const size = planId === 'solo' ? 1 : planId === 'squad' ? 5 : 10
        await subscribe(planId, undefined, size, cycleId)
      }
    } catch (err) {
      if (err instanceof ApiError && err.reason === 'upi-not-configured') {
        setSubmitError('Payments are not configured on this environment yet. Please try again later.')
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Could not subscribe — try again')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Suppress unused-var warning — `reset` is referenced via the expiredNotice banner.
  void reset

  return (
    <AppContainer>
      <PageHeader
        eyebrow={expiredNotice ? 'Subscription expired' : (user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome')}
        chapter={expiredNotice ? 'Renew' : 'Start'}
        title={expiredNotice
          ? <>Your plan ran out. <span className="italic font-light text-saffron-600">Renew?</span></>
          : 'Set up your plan'}
        description={expiredNotice
          ? 'Pick a plan to start a fresh 30-day cycle. Your skip history and group code carry over once your next payment is approved.'
          : 'Three home-cooked meals a day. Pause anytime. No autorenewal — just one payment per cycle.'}
      />

      {/* Mode toggle */}
      <div className="mt-6 sm:mt-8 inline-flex rounded-full bg-cream-100 p-1 text-sm font-medium w-full sm:w-auto">
        <button
          type="button"
          onClick={() => { setMode('new'); setSubmitError(null) }}
          className={cn(
            'flex-1 sm:flex-initial rounded-full px-5 py-2.5 sm:py-2 transition-colors text-center',
            mode === 'new' ? 'bg-ink-900 text-cream-50 shadow-soft' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          Start a new plan
        </button>
        <button
          type="button"
          onClick={() => { setMode('join'); setSubmitError(null) }}
          className={cn(
            'flex-1 sm:flex-initial rounded-full px-5 py-2.5 sm:py-2 transition-colors text-center',
            mode === 'join' ? 'bg-ink-900 text-cream-50 shadow-soft' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          Join a group
        </button>
      </div>

      {/* New plan flow */}
      {mode === 'new' && (
        <>
          {/* Subscription gate banner — explains why this page is the landing
              spot for users who haven't subscribed yet. Bigger / more visible
              than a passing toast because the user lands here every session
              until they pick a plan. */}
          <div className="mt-5 sm:mt-7 rounded-2xl border border-saffron-300 bg-saffron-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-saffron-500 text-cream-50 font-display text-lg">
                ✦
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 text-[15px] sm:text-base">
                  A subscription unlocks the rest of the app
                </p>
                <p className="mt-1 text-xs sm:text-sm text-ink-700 leading-relaxed">
                  Pick a plan and your rhythm below to start. Menu, QR pass, skips
                  and your dashboard all become available once your first
                  payment is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Plan cards — strong active treatment. Selected card flips to a
              saffron-tinted surface with a ring + lift; unselected cards stay
              in the neutral paper default. */}
          <div className="mt-6 sm:mt-8">
            <p className="text-eyebrow text-ink-500">Choose your plan</p>
            <div className="mt-3 grid gap-3 sm:gap-4 md:grid-cols-3">
              {PLANS.map((p) => {
                const active = p.id === planId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    aria-pressed={active}
                    className={cn(
                      'relative text-left rounded-2xl border p-5 sm:p-6 transition-all duration-300 ease-out active:scale-[0.99]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
                      active
                        ? 'border-saffron-500 bg-saffron-50 ring-2 ring-saffron-500/40 shadow-card -translate-y-0.5'
                        : 'border-cream-200 bg-paper hover:border-cream-300 hover:shadow-soft',
                    )}
                  >
                    {/* Active-state corner badge — gives the user a clear "yes
                        this is the one you picked" signal. */}
                    {active && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-saffron-500 px-2.5 py-1 text-[10px] font-semibold text-cream-50 shadow-soft uppercase tracking-wider">
                        ✓ Selected
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            'font-display text-lg sm:text-xl tracking-tight',
                            active ? 'text-saffron-700' : 'text-ink-900',
                          )}>
                            {p.name}
                          </h3>
                          {p.recommended && !active && <Badge tone="ink">Recommended</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-500">{p.groupSize}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'font-display text-xl sm:text-2xl tracking-tight',
                          active ? 'text-saffron-700' : 'text-ink-900',
                        )}>
                          ₹{p.pricePerMeal}
                        </p>
                        <p className="text-[11px] text-ink-500">per meal</p>
                      </div>
                    </div>
                    {p.savingPerMonth > 0 && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-leaf-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
                        Save {inr(p.savingPerMonth)} / month each
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
            {!planId && (
              <p className="mt-3 text-xs text-ink-500">
                Tap a plan to continue.
              </p>
            )}
          </div>

          {/* Cycle picker */}
          <div className="mt-6 sm:mt-8">
            <p className="text-eyebrow text-ink-500">Pick your rhythm</p>
            <div className="mt-3 grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
              {BILLING_CYCLES.map((c) => {
                const active = c.id === cycleId
                const perMeal = selectedPlan ? pricePerMealFor(selectedPlan, c) : c.pricePerMealOverride
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCycleId(c.id)}
                    aria-pressed={active}
                    className={cn(
                      'text-left rounded-2xl border p-4 transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
                      active
                        ? 'border-saffron-500 bg-saffron-50 ring-2 ring-saffron-500/40 shadow-card'
                        : 'border-cream-200 bg-paper hover:border-cream-300',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-eyebrow text-ink-500">{c.cadence}</p>
                      {/* Promo chip — shows the per-meal rate that's actually
                          on offer. For tier-scaled cycles (dinner-weekly)
                          we surface the chip only when a plan is picked so
                          the number matches what they'll pay. */}
                      {(c.pricePerMealOverride && !c.pricePerMealByPlan) && (
                        <span className="rounded-full bg-saffron-500 text-cream-50 px-2 py-0.5 text-[10px] font-semibold">
                          ₹{c.pricePerMealOverride}/meal
                        </span>
                      )}
                      {c.pricePerMealByPlan && selectedPlan && (
                        <span className="rounded-full bg-saffron-500 text-cream-50 px-2 py-0.5 text-[10px] font-semibold">
                          ₹{pricePerMealFor(selectedPlan, c)}/meal
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      'mt-1 font-display text-base tracking-tight',
                      active ? 'text-saffron-700' : 'text-ink-900',
                    )}>
                      {c.shortLabel}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{c.rhythm}</p>
                    {perMeal !== undefined && (
                      <p className="mt-2 text-[11px] font-medium text-ink-700">
                        ₹{perMeal} × {mealsFor(c)} meals
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Receipt + CTA */}
          {(() => {
            const hasPlan = !!selectedPlan
            const perPerson = selectedPlan ? priceFor(selectedPlan, cycle) : 0
            const groupSize = selectedPlan?.groupMin ?? 1
            const totalDue = perPerson * groupSize
            const isGroup = groupSize > 1
            return (
              <Card variant="outline" className="mt-6 sm:mt-8 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-eyebrow text-ink-500">
                      {hasPlan ? (isGroup ? "Per person, you'll pay" : "You'll pay") : 'No plan selected yet'}
                    </p>
                    <p className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl text-ink-900 break-words">
                      {hasPlan ? (
                        <>
                          {inr(perPerson)}
                          <span className="ml-2 text-sm text-ink-500 font-sans">/ {cycle.cadence.toLowerCase()}</span>
                        </>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {hasPlan
                        ? `${selectedPlan!.name} · ${mealsFor(cycle)} meals · ${cycle.rhythm}`
                        : 'Pick a plan above and the receipt updates instantly.'}
                    </p>
                  </div>
                  {/* CTA — outline (subdued) until a plan is picked, then
                      flips to secondary (saffron + white) "active brand
                      theme" so the user feels their selection take effect. */}
                  <Button
                    variant={hasPlan ? 'secondary' : 'outline'}
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={start}
                    disabled={submitting || !hasPlan}
                  >
                    {submitting
                      ? 'Setting up…'
                      : !hasPlan
                        ? 'Pick a plan to continue'
                        : isGroup
                          ? `Pay ${inr(totalDue)} & start`
                          : `Start my ${selectedPlan!.name} plan`}
                  </Button>
                </div>
                {hasPlan && isGroup && (
                  <div className="mt-5 rounded-2xl bg-saffron-50 border border-saffron-200 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-ink-700">
                        <span className="font-semibold">Charged today:</span>{' '}
                        <span className="font-display text-lg text-ink-900">{inr(totalDue)}</span>
                      </p>
                      <p className="text-xs text-ink-500">
                        {inr(perPerson)} × {groupSize} {selectedPlan!.id === 'squad' ? 'friends' : 'members'}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      You pay the full {selectedPlan!.name.toLowerCase()} group upfront — share the code with your {selectedPlan!.id === 'squad' ? '4 friends' : '9 floormates'} and they join without paying again.
                    </p>
                  </div>
                )}
                {submitError && (
                  <p className="mt-3 text-sm text-spice-700">{submitError}</p>
                )}
              </Card>
            )
          })()}
        </>
      )}

      {/* Join group flow */}
      {mode === 'join' && (
        <div className="mt-6 sm:mt-8 max-w-xl space-y-4 sm:space-y-5">
          <Input
            label="Group code"
            placeholder="BW-SQUAD-7K2X"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase())
              setJoinError(null)
              setJoinPreview(null)
            }}
            error={joinError ?? undefined}
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={verifyGroup}
            disabled={joinLooking || joinCode.trim().length < 3}
          >
            {joinLooking ? 'Looking up…' : joinPreview ? 'Code verified ✓' : 'Verify code'}
          </Button>

          {joinPreview && previewPlan && (
            <Card className="border-saffron-200 ring-1 ring-saffron-200 p-6">
              <p className="text-eyebrow text-saffron-700">You're joining</p>
              <h3 className="mt-1 font-display text-2xl text-ink-900">
                {previewPlan.name} · {joinPreview.area}
              </h3>
              <p className="mt-1 text-sm text-ink-700">
                <span className="font-semibold">{joinPreview.groupSize}</span> member{joinPreview.groupSize === 1 ? '' : 's'} so far
                {joinPreview.groupSize < previewPlan.groupMin && (
                  <> · {previewPlan.groupMin - joinPreview.groupSize} more needed to unlock full rate</>
                )}
              </p>
              {joinPreview.members.length > 0 && (
                <p className="mt-2 text-xs text-ink-500">
                  With: {joinPreview.members.map((m) => m.firstName).join(', ')}
                </p>
              )}
              <p className="mt-4 text-sm font-semibold text-leaf-700">
                ₹{previewPlan.pricePerMeal} / meal · {BILLING_CYCLES.find((c) => c.id === joinPreview.billingCycleId)?.shortLabel}
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="mt-5 w-full"
                onClick={start}
                disabled={submitting}
              >
                {submitting ? 'Joining…' : `Join this ${previewPlan.name.toLowerCase()} group`}
              </Button>
              {submitError && (
                <p className="mt-3 text-sm text-spice-700">{submitError}</p>
              )}
            </Card>
          )}
        </div>
      )}
    </AppContainer>
  )
}

function PauseModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (from: string, to: string) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const inFiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(inFiveDays)

  const days = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / (24 * 60 * 60 * 1000)))

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-paper p-6 shadow-card">
        <p className="text-eyebrow">Pause subscription</p>
        <h2 className="mt-2 text-display text-2xl text-ink-900">Going home for a bit?</h2>
        <p className="mt-2 text-sm text-ink-500">
          Pick your dates. We'll skip those meals and extend your plan end-date by exactly that many days. No money lost.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-ink-700">From</span>
            <input
              type="date"
              value={from}
              min={today}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-cream-300 bg-paper px-3 text-sm text-ink-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-700">Until</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-cream-300 bg-paper px-3 text-sm text-ink-900"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-leaf-100 px-3 py-2.5 text-sm text-leaf-700">
          ✓ Plan extends by {days} day{days === 1 ? '' : 's'}.
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-[2]"
            onClick={() => onConfirm(from, to)}
          >
            Confirm pause
          </Button>
        </div>
      </div>
    </div>
  )
}
