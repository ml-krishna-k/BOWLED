import { Router } from 'express'
import { Subscription, CycleEnum, PlanEnum } from '../models/Subscription.js'
import { Payment } from '../models/Payment.js'
import { SkipNotification } from '../models/SkipNotification.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../middleware/error.js'
import { SKIP_LIMITS, currentCycleSkips, isPastCutoff } from '../lib/skip.js'
import { parseBody } from '../lib/validate.js'
import {
  createSubscriptionSchema,
  pauseSchema,
  scanSchema,
  skipDaySchema,
  skipMealSchema,
  updateSubscriptionSchema,
} from '../lib/schemas.js'
import { config } from '../config.js'

const router = Router()
router.use(requireAuth)

type PlanId = typeof PlanEnum[number]
type CycleId = typeof CycleEnum[number]

/* ---------- Server-side pricing (single source of truth) -------------------
 * Mirrors src/data/plans.ts on the client. Amounts here are authoritative.
 * ------------------------------------------------------------------------- */

const PLAN_PRICE: Record<PlanId, number> = {
  solo: 89,
  squad: 69,
  floor: 63,
}

const PLAN_GROUP_MIN: Record<PlanId, number> = {
  solo: 1,
  squad: 5,
  floor: 10,
}

const CYCLE_DAYS: Record<CycleId, number> = {
  'weekly':             7,
  'weekly-no-sun':      6,
  'weekly-no-weekend':  5,
  'monthly-31':         31,
  'monthly-no-sun':     26,
  'monthly-no-weekend': 22,
  'dinner-weekly':      7,
  'dinner-monthly':     30,
}

/** Per-cycle meals-per-day override. Dinner-only cycles drop to 1. */
const CYCLE_MEALS_PER_DAY: Partial<Record<CycleId, number>> = {
  'dinner-weekly':  1,
  'dinner-monthly': 1,
}

/**
 * Per-meal price override for promotional cycles. When present, this flat
 * rate beats the plan's tier price (Solo/Squad/Floor).
 */
const CYCLE_PRICE_OVERRIDE: Partial<Record<CycleId, number>> = {
  'weekly-no-weekend': 75,
  'dinner-monthly':    70,
}

/**
 * Per-plan-per-cycle override — wins over CYCLE_PRICE_OVERRIDE and the plan
 * tier price for the matching plan id. Used for tier-scaled promotional
 * pricing (e.g. Dinner-only Weekly: ₹73 for Squad, ₹69 for Floor; Solo
 * stays on the plan's default).
 */
const CYCLE_PRICE_BY_PLAN: Partial<Record<CycleId, Partial<Record<PlanId, number>>>> = {
  'dinner-weekly': { squad: 73, floor: 69 },
}

const MEALS_PER_DAY = 3
/** How long the user has to submit a UTR + screenshot before the sub auto-expires. */
const SUBMIT_WINDOW_MS = 48 * 60 * 60 * 1000 // 48h
/** Active window granted on admin approval. */
const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function pricePerMealFor(planId: PlanId, cycleId: CycleId): number {
  return CYCLE_PRICE_BY_PLAN[cycleId]?.[planId]
    ?? CYCLE_PRICE_OVERRIDE[cycleId]
    ?? PLAN_PRICE[planId]
}

function mealsPerDayFor(cycleId: CycleId): number {
  return CYCLE_MEALS_PER_DAY[cycleId] ?? MEALS_PER_DAY
}

function totalForPlan(planId: PlanId, cycleId: CycleId): number {
  const perMember =
    pricePerMealFor(planId, cycleId) * mealsPerDayFor(cycleId) * CYCLE_DAYS[cycleId]
  return perMember * PLAN_GROUP_MIN[planId]
}

function totalMealsFor(cycleId: CycleId): number {
  return mealsPerDayFor(cycleId) * CYCLE_DAYS[cycleId]
}

function buildOrderRef(subId: string): string {
  return `BWL-${subId.slice(-8).toUpperCase()}`
}

function buildUpiUri(amount: number, orderRef: string): string {
  const params = new URLSearchParams({
    pa: config.upi.id,
    pn: config.upi.name,
    am: String(amount),
    tn: orderRef,
    cu: 'INR',
  })
  return `upi://pay?${params.toString()}`
}

function paymentInstructionsFor(sub: InstanceType<typeof Subscription>) {
  if (!config.upi.id) return null
  if (sub.status !== 'pending_payment') return null
  const orderRef = buildOrderRef(sub._id.toString())
  const amount = totalForPlan(sub.planId, sub.billingCycleId)
  const createdAt = (sub as { createdAt?: Date }).createdAt?.getTime() ?? Date.now()
  return {
    orderRef,
    amount,
    upiId: config.upi.id,
    businessName: config.upi.name,
    upiUri: buildUpiUri(amount, orderRef),
    submitExpiresAt: createdAt + SUBMIT_WINDOW_MS,
  }
}

/* ---------- Helpers used by approve + expiry checks ----------------------- */

/** Has a pending sub blown past the 48h submit window? */
function isSubmitExpired(sub: InstanceType<typeof Subscription>): boolean {
  if (sub.status !== 'pending_payment') return false
  const createdAt = (sub as { createdAt?: Date }).createdAt?.getTime() ?? 0
  return createdAt > 0 && Date.now() - createdAt > SUBMIT_WINDOW_MS
}

/** Has an active sub blown past its 30-day window? */
function isActiveExpired(sub: InstanceType<typeof Subscription>): boolean {
  return sub.status === 'active' && sub.expiresAt > 0 && Date.now() > sub.expiresAt
}

/**
 * Check the subscription against its time-based expiry rules and flip status
 * if needed. Run on every GET so we never serve a stale "still active" doc.
 */
async function reconcileExpiry(sub: InstanceType<typeof Subscription>) {
  if (isSubmitExpired(sub) || isActiveExpired(sub)) {
    sub.status = 'expired'
    await sub.save()
  }
}

/* ---------- Routes -------------------------------------------------------- */

/**
 * GET /api/subscription — current user's subscription (null if none).
 * Includes payment instructions when status === 'pending_payment'.
 */
router.get('/', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) {
    res.json({ subscription: null, paymentInstructions: null })
    return
  }
  await reconcileExpiry(sub)
  res.json({
    subscription: serializeSubscription(sub),
    paymentInstructions: paymentInstructionsFor(sub),
  })
})

/**
 * POST /api/subscription — start a new plan.
 *
 * Two paths:
 *   1. groupCode → join an existing group. Inherits plan + cycle from the
 *      group's originator. Joiners are billed at the group level (they don't
 *      pay individually), so we mark them `active` immediately.
 *   2. No groupCode → originator path. Creates a NEW sub in `pending_payment`
 *      status. The user is shown UPI instructions, pays via any UPI app,
 *      uploads UTR + screenshot via POST /api/payments. Admin verification
 *      flips status to `active`.
 *
 * The response always includes paymentInstructions (null for joiners).
 */
router.post('/', async (req, res) => {
  const input = parseBody(createSubscriptionSchema, req)

  const existing = await Subscription.findOne({ userId: req.auth!.uid })
  if (existing) {
    // If the existing one is `expired`, allow re-subscribing by deleting it.
    if (existing.status === 'expired') {
      await Subscription.deleteOne({ _id: existing._id })
    } else {
      throw new HttpError(409, 'Subscription already exists for this user', { reason: 'has-subscription' })
    }
  }

  let planId = input.planId
  let billingCycleId = input.billingCycleId ?? 'monthly-31'
  let groupCode = input.groupCode?.trim()
  const isJoin = !!groupCode

  if (isJoin) {
    const groupMember = await Subscription.findOne({ groupCode })
    if (!groupMember) throw new HttpError(404, 'No group with that code', { reason: 'group-not-found' })
    if (groupMember.planId === 'solo') {
      throw new HttpError(409, 'That code belongs to a Solo subscriber and cannot be joined', { reason: 'solo-group' })
    }
    // Inherit plan + cycle from the group; ignore whatever the client passed.
    planId = groupMember.planId
    billingCycleId = groupMember.billingCycleId
  } else {
    if (!config.upi.id) {
      throw new HttpError(503, 'Payments are not configured on this environment', { reason: 'upi-not-configured' })
    }
    groupCode = `BW-${planId.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  }

  const now = Date.now()

  // Joiners → active immediately, full 30-day window. Originators → pending.
  const sub = await Subscription.create({
    userId: req.auth!.uid,
    planId,
    billingCycleId,
    groupCode,
    groupSize: 1, // recomputed below
    startedAt: isJoin ? now : 0,
    cycleStartedAt: isJoin ? now : 0,
    expiresAt: isJoin ? now + ACTIVE_WINDOW_MS : 0,
    totalMeals: totalMealsFor(billingCycleId),
    mealsServed: 0,
    today: { breakfast: 'pending', lunch: 'pending', dinner: 'pending' },
    history: [],
    pause: null,
    mealSkips: [],
    daySkips: [],
    status: isJoin ? 'active' : 'pending_payment',
  })

  // Recompute groupSize across every member of this group.
  const memberCount = await Subscription.countDocuments({ groupCode })
  await Subscription.updateMany({ groupCode }, { $set: { groupSize: memberCount } })
  sub.groupSize = memberCount

  res.status(201).json({
    subscription: serializeSubscription(sub),
    paymentInstructions: paymentInstructionsFor(sub),
  })
})

/* PATCH /api/subscription — change the billing cycle. */
router.patch('/', async (req, res) => {
  const patch = parseBody(updateSubscriptionSchema, req)
  const sub = await Subscription.findOneAndUpdate(
    { userId: req.auth!.uid },
    { $set: patch },
    { new: true },
  )
  if (!sub) throw new HttpError(404, 'No active subscription')
  res.json({ subscription: serializeSubscription(sub) })
})

/* DELETE /api/subscription — cancel (used by the "reset" flow). */
router.delete('/', async (req, res) => {
  // Also clean up the user's pending payments so they can resubscribe with a fresh UTR.
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (sub) await Payment.deleteMany({ subscriptionId: sub._id, status: 'pending_verification' })
  await Subscription.deleteOne({ userId: req.auth!.uid })
  res.json({ ok: true })
})

/* POST /api/subscription/skip-meal { date, slot } */
router.post('/skip-meal', async (req, res) => {
  const { date, slot } = parseBody(skipMealSchema, req)

  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  if (sub.status !== 'active') throw new HttpError(409, 'Subscription is not active', { reason: 'not-active' })
  if (!sub.billingCycleId?.startsWith('monthly')) {
    throw new HttpError(409, 'Skips are only available on monthly plans', { reason: 'not-monthly' })
  }
  const todayStr = new Date().toISOString().slice(0, 10)
  if (date < todayStr) throw new HttpError(409, 'Date is in the past', { reason: 'past-date' })
  if (isPastCutoff({ date, slot })) {
    throw new HttpError(409, 'Cutoff has passed for this meal', { reason: 'cutoff-passed' })
  }
  const used = currentCycleSkips(sub.mealSkips, sub.cycleStartedAt).length
  if (used >= SKIP_LIMITS.meal) {
    throw new HttpError(409, 'Meal skip limit reached for this cycle', { reason: 'limit-reached' })
  }
  if (sub.mealSkips.some((m) => m.date === date && m.slot === slot)) {
    throw new HttpError(409, 'That meal is already marked to skip', { reason: 'duplicate' })
  }
  if (sub.daySkips.some((d) => d.date === date)) {
    throw new HttpError(409, 'That day is already marked as a full-day skip', { reason: 'duplicate' })
  }

  const id = `ms_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const requestedAt = Date.now()
  sub.mealSkips.push({ id, date, slot, requestedAt })
  await sub.save()

  const user = await User.findById(req.auth!.uid)
  await SkipNotification.create({
    kind: 'meal',
    userId: req.auth!.uid,
    subscriberName: user?.name ?? 'Subscriber',
    groupCode: sub.groupCode,
    date,
    slot,
    requestedAt,
  })

  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/skip-day { date } */
router.post('/skip-day', async (req, res) => {
  const { date } = parseBody(skipDaySchema, req)

  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  if (sub.status !== 'active') throw new HttpError(409, 'Subscription is not active', { reason: 'not-active' })
  if (!sub.billingCycleId?.startsWith('monthly')) {
    throw new HttpError(409, 'Skips are only available on monthly plans', { reason: 'not-monthly' })
  }
  const todayStr = new Date().toISOString().slice(0, 10)
  if (date < todayStr) throw new HttpError(409, 'Date is in the past', { reason: 'past-date' })
  if (isPastCutoff({ date })) {
    throw new HttpError(409, 'Full-day skips must be confirmed by the previous day', { reason: 'cutoff-passed' })
  }
  const used = currentCycleSkips(sub.daySkips, sub.cycleStartedAt).length
  if (used >= SKIP_LIMITS.day) {
    throw new HttpError(409, 'Day skip limit reached for this cycle', { reason: 'limit-reached' })
  }
  if (sub.daySkips.some((d) => d.date === date)) {
    throw new HttpError(409, 'That day is already marked', { reason: 'duplicate' })
  }

  const id = `ds_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const requestedAt = Date.now()
  // Day skip supersedes any per-meal skips for that date.
  sub.mealSkips = sub.mealSkips.filter((m) => m.date !== date) as typeof sub.mealSkips
  sub.daySkips.push({ id, date, requestedAt })
  await sub.save()

  const user = await User.findById(req.auth!.uid)
  await SkipNotification.create({
    kind: 'day',
    userId: req.auth!.uid,
    subscriberName: user?.name ?? 'Subscriber',
    groupCode: sub.groupCode,
    date,
    requestedAt,
  })

  res.json({ subscription: serializeSubscription(sub) })
})

/* DELETE /api/subscription/skips/meal/:id */
router.delete('/skips/meal/:id', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  sub.mealSkips = sub.mealSkips.filter((m) => m.id !== req.params.id) as typeof sub.mealSkips
  await sub.save()
  await SkipNotification.deleteOne({ _id: req.params.id }).catch(() => {})
  await SkipNotification.deleteMany({ userId: req.auth!.uid, kind: 'meal' }).catch(() => {})
  res.json({ subscription: serializeSubscription(sub) })
})

/* DELETE /api/subscription/skips/day/:id */
router.delete('/skips/day/:id', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  sub.daySkips = sub.daySkips.filter((d) => d.id !== req.params.id) as typeof sub.daySkips
  await sub.save()
  await SkipNotification.deleteOne({ _id: req.params.id }).catch(() => {})
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/scan { slot? } — mark a meal as served */
const SLOTS = ['breakfast', 'lunch', 'dinner'] as const
router.post('/scan', async (req, res) => {
  const input = parseBody(scanSchema, req)
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  if (sub.status !== 'active') throw new HttpError(409, 'Subscription is not active', { reason: 'not-active' })
  if (!sub.today) throw new HttpError(500, 'Subscription missing today state')
  if (sub.mealsServed >= sub.totalMeals) throw new HttpError(409, 'No meals left to serve')

  const today = sub.today
  const target = input.slot ?? SLOTS.find((s) => today[s] === 'pending')
  if (!target) throw new HttpError(409, 'No pending meal to scan')
  if (today[target] !== 'pending') throw new HttpError(409, `${target} is not pending`)

  today[target] = 'served'
  sub.mealsServed = (sub.mealsServed ?? 0) + 1
  sub.history.unshift({
    scannedAt: Date.now(),
    day: Math.max(1, Math.floor((Date.now() - sub.startedAt) / (24 * 60 * 60 * 1000)) + 1),
    slot: target,
    mealName: input.mealName ?? 'Meal',
  })
  while (sub.history.length > 50) sub.history.pop()
  await sub.save()
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/skip-next */
router.post('/skip-next', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  if (sub.status !== 'active') throw new HttpError(409, 'Subscription is not active', { reason: 'not-active' })
  if (!sub.today) throw new HttpError(500, 'Subscription missing today state')
  const today = sub.today
  const target = SLOTS.find((s) => today[s] === 'pending')
  if (!target) throw new HttpError(409, 'Nothing left to skip today')
  today[target] = 'skipped'
  await sub.save()
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/pause */
router.post('/pause', async (req, res) => {
  const { fromIso, toIso } = parseBody(pauseSchema, req)
  const sub = await Subscription.findOneAndUpdate(
    { userId: req.auth!.uid },
    { $set: { pause: { from: Date.parse(fromIso), to: Date.parse(toIso) } } },
    { new: true },
  )
  if (!sub) throw new HttpError(404, 'No active subscription')
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/resume */
router.post('/resume', async (req, res) => {
  const sub = await Subscription.findOneAndUpdate(
    { userId: req.auth!.uid },
    { $set: { pause: null } },
    { new: true },
  )
  if (!sub) throw new HttpError(404, 'No active subscription')
  res.json({ subscription: serializeSubscription(sub) })
})

/* ---------- Helpers ------------------------------------------------------- */

export function serializeSubscription(s: InstanceType<typeof Subscription>) {
  return {
    planId: s.planId,
    billingCycleId: s.billingCycleId,
    groupCode: s.groupCode,
    groupSize: s.groupSize,
    startedAt: s.startedAt,
    cycleStartedAt: s.cycleStartedAt,
    expiresAt: s.expiresAt,
    totalMeals: s.totalMeals,
    mealsServed: s.mealsServed,
    status: s.status,
    today: s.today,
    history: s.history,
    pause: s.pause,
    mealSkips: s.mealSkips,
    daySkips: s.daySkips,
  }
}

export {
  PLAN_PRICE,
  PLAN_GROUP_MIN,
  CYCLE_DAYS,
  MEALS_PER_DAY,
  SUBMIT_WINDOW_MS,
  ACTIVE_WINDOW_MS,
  totalForPlan,
  buildOrderRef,
}
export default router
