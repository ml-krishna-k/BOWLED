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
    <Section id="plans" className="bg-cream-50">
      <Container>
        <SectionHeading
          eyebrow="Subscription plans"
          title={<>The more of you join, <span className="text-saffron-600">the less you pay.</span></>}
          description="Pick a rhythm that fits your week — then choose Solo, Squad or Floor. Per-meal price stays the same; the more friends you bring, the more you save."
        />

        {/* Billing cycle selector */}
        <div className="mt-12">
          <p className="text-center text-eyebrow text-ink-500 mb-4">
            Choose your rhythm
          </p>
          <div
            role="tablist"
            aria-label="Billing cycle"
            className="mx-auto max-w-3xl flex flex-wrap justify-center gap-2 rounded-full bg-paper border border-cream-200 p-1.5 shadow-soft"
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
                    'relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
                    active
                      ? 'bg-ink-900 text-cream-50 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  {c.shortLabel}
                </button>
              )
            })}
          </div>

          {/* Cycle context line */}
          <div className="mt-5 mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-paper border border-cream-200 px-4 py-1.5 text-xs text-ink-600 shadow-soft">
              <span className="font-semibold text-ink-900">{cycle.rhythm}</span>
              <span className="text-ink-400">·</span>
              <span>{cycle.description}</span>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const total = priceFor(plan, cycle)
            const meals = mealsFor(cycle)
            const saved = savingsFor(plan, cycle)

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative p-7 sm:p-8 flex flex-col',
                  plan.recommended && 'border-saffron-300 ring-1 ring-saffron-300',
                )}
                variant={plan.recommended ? 'default' : 'soft'}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="ink">Most popular</Badge>
                  </div>
                )}

                <div>
                  <p className="text-eyebrow">{plan.groupSize}</p>
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl text-ink-900">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <p className="mt-2 text-sm text-saffron-700 font-medium">
                      {plan.highlight}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  <span className="font-display text-4xl sm:text-5xl text-ink-900 leading-none">
                    {inr(total)}
                  </span>
                  <span className="text-ink-500 text-sm">
                    / {cycle.cadence.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {inr(plan.pricePerMeal)} per meal · {meals} meals · {cycle.rhythm}
                </p>

                {saved > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-semibold text-leaf-700 self-start">
                    <span>↓ {inr(plan.savingPerMeal)}/meal</span>
                    <span className="text-leaf-700/60">·</span>
                    <span>You save {inr(saved)} this {cycle.cadence.toLowerCase()}</span>
                  </div>
                )}

                <ul className="mt-6 space-y-3 text-[15px] text-ink-700">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700"
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

                <div className="mt-8 pt-2">
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

        <p className="mt-10 text-center text-sm text-ink-500 max-w-2xl mx-auto">
          One-time payment via UPI, card or netbanking. No auto-renew, no surprise charges. Skip days extend your plan — you never lose what you paid for.{' '}
          <a href="#faq" className="text-saffron-700 font-medium hover:underline">
            See FAQ →
          </a>
        </p>
      </Container>
    </Section>
  )
}
