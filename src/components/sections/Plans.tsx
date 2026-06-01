import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  PLANS,
  BILLING_CYCLES,
  type BillingCycleId,
  priceFor,
  mealsFor,
  savingsFor,
} from '@/data/plans'
import { cn } from '@/lib/cn'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function Plans() {
  const navigate = useNavigate()
  const [cycleId, setCycleId] = useState<BillingCycleId>('monthly-no-sun')
  const cycle = BILLING_CYCLES.find((c) => c.id === cycleId)!

  return (
    <Section id="plans" className="bg-cream-50 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh opacity-30" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Subscription plans"
          title={<>The more of you join, <span className="italic font-light text-saffron-600">the less you pay.</span></>}
          description="Pick a rhythm that fits your week — then choose Solo, Squad or Floor. Per-meal price stays the same; the more friends you bring, the more you save."
        />

        {/* Billing cycle selector — horizontal scroll on mobile so 4 chips stay
            on one line instead of wrapping to two rows. */}
        <div className="mt-10 sm:mt-14">
          <p className="text-center text-eyebrow text-ink-500 mb-3 sm:mb-4">
            Choose your rhythm
          </p>
          <div
            role="tablist"
            aria-label="Billing cycle"
            className="mx-auto max-w-3xl flex sm:flex-wrap sm:justify-center gap-1 rounded-full bg-paper border border-cream-200 p-1 sm:p-1.5 shadow-soft ring-inset-warm overflow-x-auto sm:overflow-visible"
          >
            {BILLING_CYCLES.map((c) => {
              const active = c.id === cycleId
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCycleId(c.id)}
                  className={cn(
                    'relative shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-medium transition-all duration-300 whitespace-nowrap',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
                    active
                      ? 'bg-ink-900 text-cream-50 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-cream-50',
                  )}
                >
                  {c.shortLabel}
                </button>
              )
            })}
          </div>

          {/* Cycle context line — caption-style on mobile so it doesn't crowd */}
          <div className="mt-4 sm:mt-5 mx-auto max-w-2xl text-center px-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-paper border border-cream-200 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-ink-600 shadow-soft">
              <span className="font-semibold text-ink-900">{cycle.rhythm}</span>
              <span className="text-ink-400">·</span>
              <span>{cycle.description}</span>
            </div>
          </div>
        </div>

        {/* Plan cards — stacked on mobile (Recommended in the middle), 3-col at lg. */}
        <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => {
            const total = priceFor(plan, cycle)
            const meals = mealsFor(cycle)
            const saved = savingsFor(plan, cycle)

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative p-5 sm:p-7 lg:p-8 flex flex-col lift-card overflow-hidden',
                  plan.recommended &&
                    'border-saffron-300 ring-1 ring-saffron-300 lg:-translate-y-2 lg:scale-[1.015]',
                )}
                variant={plan.recommended ? 'default' : 'soft'}
              >
                {plan.recommended && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-saffron-200/40 blur-3xl"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge tone="ink">★ Most popular</Badge>
                    </div>
                  </>
                )}

                <div className="relative">
                  <p className="text-eyebrow">{plan.groupSize}</p>
                  <h3 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl text-ink-900 tracking-tight">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <p className="mt-2 text-[13px] sm:text-sm text-saffron-700 font-medium">
                      {plan.highlight}
                    </p>
                  )}
                </div>

                <div className="relative mt-4 sm:mt-6 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  <span className="text-editorial text-4xl sm:text-5xl lg:text-6xl text-ink-900">
                    {inr(total)}
                  </span>
                  <span className="text-ink-500 text-sm">
                    / {cycle.cadence.toLowerCase()}
                  </span>
                </div>
                <p className="relative mt-1.5 text-[13px] sm:text-sm text-ink-500">
                  {inr(plan.pricePerMeal)} per meal · {meals} meals · {cycle.rhythm}
                </p>

                {saved > 0 && (
                  <div className="relative mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-leaf-100 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-leaf-700 self-start ring-1 ring-leaf-300/40 max-w-full">
                    <span className="shrink-0">↓ {inr(plan.savingPerMeal)}/meal</span>
                    <span className="text-leaf-700/60 hidden sm:inline">·</span>
                    <span className="hidden sm:inline">Save {inr(saved)} this {cycle.cadence.toLowerCase()}</span>
                  </div>
                )}

                <div className="relative mt-5 sm:mt-6 hairline" />

                <ul className="relative mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-[14px] sm:text-[15px] text-ink-700 flex-1">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700 ring-1 ring-leaf-300/40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8 pt-2">
                  <Button
                    variant={plan.recommended ? 'secondary' : 'outline'}
                    className="w-full"
                    size="lg"
                    onClick={() => navigate('/auth/signup', { state: { preselectedPlan: plan.id, preselectedCycle: cycle.id } })}
                  >
                    {plan.id === 'solo'
                      ? `Subscribe ${cycle.cadence.toLowerCase()}`
                      : `Start ${plan.name.toLowerCase()} · ${cycle.cadence.toLowerCase()}`}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <p className="mt-12 text-center text-sm text-ink-500 max-w-2xl mx-auto">
          One-time payment via UPI, card or netbanking. No auto-renew, no surprise charges. Skip days extend your plan — you never lose what you paid for.{' '}
          <a href="#faq" className="text-saffron-700 font-medium hover:underline underline-offset-4 decoration-saffron-300">
            See FAQ →
          </a>
        </p>
      </Container>
    </Section>
  )
}
