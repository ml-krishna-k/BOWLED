import type { Plan } from '@/types'

/**
 * Per-meal price stays the same across cycles — only the day count changes.
 * Cycles are surfaced via BILLING_CYCLES below.
 */
export const PLANS: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    groupSize: 'Just you',
    groupMin: 1,
    pricePerMeal: 89,
    monthlyPrice: 8010,
    meals: 90,
    savingPerMeal: 0,
    savingPerMonth: 0,
    perks: [
      'Breakfast + lunch + dinner, every day',
      'Weekly rotating chef menu',
      'Pause anytime — plan auto-extends by the days you skip',
      'Free same-day delivery to your PG',
      'One-time payment, no recharges, no surprise charges',
    ],
    highlight: 'Great if you\'re just trying us out',
  },
  {
    id: 'squad',
    name: 'Squad',
    groupSize: '5 friends or roommates',
    groupMin: 5,
    pricePerMeal: 69,
    monthlyPrice: 6210,
    meals: 90,
    savingPerMeal: 20,
    savingPerMonth: 1800,
    perks: [
      'Everything in Solo — all 3 meals daily',
      '₹20 off per meal · save ₹1,800 / month each',
      'One delivery drop, individual portions',
      'Group-pause if all of you travel together',
      'Parent peace-of-mind report included',
    ],
    recommended: true,
    highlight: 'Save ₹1,800/month each',
  },
  {
    id: 'floor',
    name: 'Floor',
    groupSize: '10+ from your hostel floor',
    groupMin: 10,
    pricePerMeal: 63,
    monthlyPrice: 5670,
    meals: 90,
    savingPerMeal: 26,
    savingPerMonth: 2340,
    perks: [
      'Everything in Squad — all 3 meals daily',
      '₹26 off per meal · save ₹2,340 / month each',
      'Dedicated 30-min delivery window',
      'Festive special meals included',
      'Custom menu request once a month',
    ],
    highlight: 'Best value — save ₹2,340/month each',
  },
]

/* ---------------------------------------------------------------------------
 * Billing cycles — every plan (Solo / Squad / Floor) can be subscribed under
 * any of these. Day counts reflect a typical 30-day month.
 * ------------------------------------------------------------------------- */

export type BillingCycleId =
  | 'weekly'
  | 'weekly-no-sun'
  | 'monthly-no-sun'
  | 'monthly-no-weekend'

export interface BillingCycle {
  id: BillingCycleId
  label: string
  shortLabel: string
  cadence: 'Weekly' | 'Monthly'
  days: number
  mealsPerDay: number
  description: string
  tagline: string
  rhythm: string
}

export const MEALS_PER_DAY = 3

export const BILLING_CYCLES: BillingCycle[] = [
  {
    id: 'weekly',
    label: 'Weekly · All 7 days',
    shortLabel: 'Weekly',
    cadence: 'Weekly',
    days: 7,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Mon to Sun, every meal of the week.',
    tagline: 'Try us for a week',
    rhythm: '3 meals × 7 days',
  },
  {
    id: 'weekly-no-sun',
    label: 'Weekly · Mon to Sat',
    shortLabel: 'Weekly · No Sun',
    cadence: 'Weekly',
    days: 6,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Six days on, Sunday off for home calls and lazy mornings.',
    tagline: 'Take Sundays off',
    rhythm: '3 meals × 6 days',
  },
  {
    id: 'monthly-no-sun',
    label: 'Monthly · No Sundays',
    shortLabel: 'Monthly · No Sun',
    cadence: 'Monthly',
    days: 26,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Full month of meals, Sundays free.',
    tagline: 'Most chosen',
    rhythm: '3 meals × 26 days',
  },
  {
    id: 'monthly-no-weekend',
    label: 'Monthly · Weekdays only',
    shortLabel: 'Monthly · No Sat & Sun',
    cadence: 'Monthly',
    days: 22,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Built around college and office weeks — Sat & Sun free.',
    tagline: 'Weekdays only',
    rhythm: '3 meals × 22 days',
  },
]

/** Total price for a plan under a billing cycle. */
export function priceFor(plan: Plan, cycle: BillingCycle): number {
  return plan.pricePerMeal * cycle.mealsPerDay * cycle.days
}

/** Total meal count for a billing cycle. */
export function mealsFor(cycle: BillingCycle): number {
  return cycle.mealsPerDay * cycle.days
}

/**
 * Savings for a non-Solo plan, computed against Solo's per-meal rate.
 * Returns 0 for Solo.
 */
export function savingsFor(plan: Plan, cycle: BillingCycle): number {
  return plan.savingPerMeal * cycle.mealsPerDay * cycle.days
}
