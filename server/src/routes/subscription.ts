import { Router } from 'express'
import { Subscription, PlanEnum } from '../models/Subscription.js'
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

const router = Router()
router.use(requireAuth)

const PLAN_PRICE: Record<typeof PlanEnum[number], number> = {
  solo: 89,
  squad: 69,
  floor: 63,
}

const PLAN_GROUP_MIN: Record<typeof PlanEnum[number], number> = {
  solo: 1,
  squad: 5,
  floor: 10,
}

/* GET /api/subscription — current user's subscription (null if none). */
router.get('/', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  res.json({ subscription: sub ? serializeSubscription(sub) : null })
})

/* POST /api/subscription — create the current user's subscription.
 *
 * Two paths:
 *   1. No groupCode → creates a new group, this user is the originator.
 *   2. groupCode supplied → joins an existing group. The group's plan and
 *      billing cycle are inherited (client values are ignored), and every
 *      member's groupSize is recomputed and persisted so reads stay in sync.
 *
 * Solo plans always create a fresh single-member group.
 */
router.post('/', async (req, res) => {
  const input = parseBody(createSubscriptionSchema, req)

  const existing = await Subscription.findOne({ userId: req.auth!.uid })
  if (existing) throw new HttpError(409, 'Subscription already exists for this user')

  let planId = input.planId
  let billingCycleId = input.billingCycleId ?? 'monthly-no-sun'
  let groupCode = input.groupCode?.trim()
  // Any non-empty groupCode means "I want to join this group" — the planId
  // the client sent is informational at best; the group's own plan is the
  // source of truth.
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
    groupCode = `BW-${planId.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  }

  const now = Date.now()
  const sub = await Subscription.create({
    userId: req.auth!.uid,
    planId,
    billingCycleId,
    groupCode,
    groupSize: 1, // temporary — recomputed below
    startedAt: now,
    cycleStartedAt: now,
    totalMeals: 90,
    mealsServed: 0,
    today: { breakfast: 'pending', lunch: 'pending', dinner: 'pending' },
    history: [],
    pause: null,
    mealSkips: [],
    daySkips: [],
    status: 'active',
  })

  // Recompute groupSize across every member of this group (one query updates
  // all rows including the one we just created).
  const memberCount = await Subscription.countDocuments({ groupCode })
  await Subscription.updateMany({ groupCode }, { $set: { groupSize: memberCount } })
  sub.groupSize = memberCount

  res.status(201).json({ subscription: serializeSubscription(sub) })
})

/* PATCH /api/subscription — change the billing cycle (currently the only
 * field a subscriber can edit themselves). */
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

/* DELETE /api/subscription — cancel (used by the "reset" flow on the client). */
router.delete('/', async (req, res) => {
  await Subscription.deleteOne({ userId: req.auth!.uid })
  res.json({ ok: true })
})

/* POST /api/subscription/skip-meal { date, slot } */
router.post('/skip-meal', async (req, res) => {
  const { date, slot } = parseBody(skipMealSchema, req)

  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
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
  // Pull the corresponding kitchen notification as well — undo means undo.
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
  // Cap history length without re-assigning the DocumentArray (Mongoose
  // requires in-place mutation for subdoc arrays).
  while (sub.history.length > 50) sub.history.pop()
  await sub.save()
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/skip-next — mark next pending slot as skipped (no skip-allowance impact) */
router.post('/skip-next', async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.auth!.uid })
  if (!sub) throw new HttpError(404, 'No active subscription')
  if (!sub.today) throw new HttpError(500, 'Subscription missing today state')
  const today = sub.today
  const target = SLOTS.find((s) => today[s] === 'pending')
  if (!target) throw new HttpError(409, 'Nothing left to skip today')
  today[target] = 'skipped'
  await sub.save()
  res.json({ subscription: serializeSubscription(sub) })
})

/* POST /api/subscription/pause { fromIso, toIso } */
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

export function serializeSubscription(s: InstanceType<typeof Subscription>) {
  return {
    planId: s.planId,
    billingCycleId: s.billingCycleId,
    groupCode: s.groupCode,
    groupSize: s.groupSize,
    startedAt: s.startedAt,
    cycleStartedAt: s.cycleStartedAt,
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

export { PLAN_PRICE }
export default router
