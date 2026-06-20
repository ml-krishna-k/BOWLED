import type { Plan } from '@/types'

/**
 * Per-meal price stays the same across cycles — only the day count changes,
 * unless a cycle sets `pricePerMealOverride` (used by the special-pricing
 * dinner-only and Mon-to-Fri rhythms).
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
    pricePerMeal: 75,
    monthlyPrice: 6750,
    meals: 90,
    savingPerMeal: 14,
    savingPerMonth: 1260,
    perks: [
      'Everything in Solo — all 3 meals daily',
      '₹14 off per meal · save ₹1,260 / month each',
      'One delivery drop, individual portions',
      'Group-pause if all of you travel together',
      'Parent peace-of-mind report included',
    ],
    recommended: true,
    highlight: 'Save ₹1,260/month each',
  },
  {
    id: 'floor',
    name: 'Floor',
    groupSize: '10+ from your hostel floor',
    groupMin: 10,
    pricePerMeal: 69,
    monthlyPrice: 6210,
    meals: 90,
    savingPerMeal: 20,
    savingPerMonth: 1800,
    perks: [
      'Everything in Squad — all 3 meals daily',
      '₹20 off per meal · save ₹1,800 / month each',
      'Dedicated 30-min delivery window',
      'Festive special meals included',
      'Custom menu request once a month',
    ],
    highlight: 'Best value — save ₹1,800/month each',
  },
]

/* ---------------------------------------------------------------------------
 * Billing cycles — every plan (Solo / Squad / Floor) can be subscribed under
 * any of these. Two new shapes added:
 *
 *   • `pricePerMealOverride` — fixed per-meal rate that supersedes the plan's
 *     default per-meal price. Used for the "no Sat & Sun" weekly (₹75/meal)
 *     and "dinner-only monthly" (₹70/meal) promotional rhythms.
 *   • `mealsPerDay` — was always 3; can now be 1 for dinner-only cycles.
 * ------------------------------------------------------------------------- */

export type BillingCycleId =
  | 'weekly'
  | 'weekly-no-sun'
  | 'weekly-no-weekend'
  | 'monthly-31'
  | 'monthly-no-sun'
  | 'monthly-no-weekend'
  | 'dinner-weekly'
  | 'dinner-monthly'

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
  /** Flat per-meal rate that supersedes the plan's pricePerMeal for every
   *  tier (Solo/Squad/Floor). Used by promotional rhythms that aren't tier-
   *  scaled — e.g. the ₹70 Dinner-only Monthly. */
  pricePerMealOverride?: number
  /** Per-plan per-meal rate. Wins over both `pricePerMealOverride` and the
   *  plan's own `pricePerMeal` when the active plan id is present in the
   *  map. Used for tier-scaled promotional rhythms — e.g. Dinner-only Weekly
   *  is ₹73/meal for Squad and ₹69/meal for Floor, with Solo on the default. */
  pricePerMealByPlan?: Partial<Record<Plan['id'], number>>
}

export const MEALS_PER_DAY = 3

export const BILLING_CYCLES: BillingCycle[] = [
  {
    id: 'monthly-31',
    label: 'Complete 31-Day Monthly Plan',
    shortLabel: '31-Day Monthly',
    cadence: 'Monthly',
    days: 31,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Complete 31-Day Monthly Plan — every meal, every day for a whole month.',
    tagline: 'Most chosen',
    rhythm: '3 meals × 31 days',
  },
  {
    id: 'monthly-no-sun',
    label: 'Monthly · No Sundays',
    shortLabel: 'Monthly · No Sun',
    cadence: 'Monthly',
    days: 26,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Full month of meals, Sundays free.',
    tagline: 'Sundays off',
    rhythm: '3 meals × 26 days',
  },
  {
    id: 'monthly-no-weekend',
    label: 'Monthly · Weekdays only',
    shortLabel: 'Monthly · Mon–Fri',
    cadence: 'Monthly',
    days: 22,
    mealsPerDay: MEALS_PER_DAY,
    description: 'Built around college and office weeks — Sat & Sun free.',
    tagline: 'Weekdays only',
    rhythm: '3 meals × 22 days',
  },
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
    id: 'weekly-no-weekend',
    label: 'Weekly · No Sat & Sun',
    shortLabel: 'Weekly · Mon–Fri',
    cadence: 'Weekly',
    days: 5,
    mealsPerDay: MEALS_PER_DAY,
    pricePerMealOverride: 75,
    description: 'Weekly plan with no Saturday & Sunday — flat ₹75 per meal.',
    tagline: 'Mon–Fri at ₹75/meal',
    rhythm: '3 meals × 5 days',
  },
  {
    id: 'dinner-weekly',
    label: 'Dinner-only · Weekly',
    shortLabel: 'Dinner-only · Weekly',
    cadence: 'Weekly',
    days: 7,
    mealsPerDay: 1,
    // Group-scaled promotional pricing: ₹73 / dinner for a Squad of 5,
    // ₹69 / dinner for a Floor of 10+. Solo subscribers fall back to the
    // plan's tier price (₹89).
    pricePerMealByPlan: { squad: 73, floor: 69 },
    description: 'Just dinners, all week — one home-cooked night meal delivered every evening for 7 days. Squad of 5 pays ₹73 / dinner, Floor of 10+ pays ₹69 / dinner.',
    tagline: 'Group dinners',
    rhythm: '1 dinner × 7 days',
  },
  {
    id: 'dinner-monthly',
    label: 'Dinner-only Monthly Plan',
    shortLabel: 'Dinner-only · Monthly',
    cadence: 'Monthly',
    days: 30,
    mealsPerDay: 1,
    pricePerMealOverride: 70,
    description: 'A full month of dinners — one home-cooked night meal delivered every evening for 30 days. Flat ₹70 per dinner, no tier upgrades or hidden fees.',
    tagline: 'Every night, ₹70',
    rhythm: '1 dinner × 30 days',
  },
]

/** Per-meal price for a given plan + cycle.
 *  Resolution order (most specific wins):
 *    1. cycle.pricePerMealByPlan[plan.id]   — tier-scaled promotional rate
 *    2. cycle.pricePerMealOverride          — flat promotional rate
 *    3. plan.pricePerMeal                   — default tier price
 */
export function pricePerMealFor(plan: Plan, cycle: BillingCycle): number {
  return cycle.pricePerMealByPlan?.[plan.id]
    ?? cycle.pricePerMealOverride
    ?? plan.pricePerMeal
}

/** Total price for a plan under a billing cycle. */
export function priceFor(plan: Plan, cycle: BillingCycle): number {
  return pricePerMealFor(plan, cycle) * cycle.mealsPerDay * cycle.days
}

/** Total meal count for a billing cycle. */
export function mealsFor(cycle: BillingCycle): number {
  return cycle.mealsPerDay * cycle.days
}

/**
 * Savings for a non-Solo plan, computed against Solo's per-meal rate. Returns
 * 0 for Solo and for cycles that aren't tier-scaled (a flat
 * `pricePerMealOverride` already IS the discount; for tier-scaled promo
 * pricing — `pricePerMealByPlan` — savings are derived against the Solo
 * tier rate so the user sees the group discount in money terms). */
export function savingsFor(plan: Plan, cycle: BillingCycle): number {
  if (cycle.pricePerMealOverride && !cycle.pricePerMealByPlan) return 0
  const soloRate = cycle.pricePerMealByPlan?.solo
    ?? cycle.pricePerMealOverride
    ?? PLANS[0].pricePerMeal
  const perMealSaving = Math.max(0, soloRate - pricePerMealFor(plan, cycle))
  return perMealSaving * cycle.mealsPerDay * cycle.days
}
