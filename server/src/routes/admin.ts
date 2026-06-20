import { Router } from 'express'
import { Subscription } from '../models/Subscription.js'
import { Payment } from '../models/Payment.js'
import { PaymentAudit } from '../models/PaymentAudit.js'
import { SkipNotification } from '../models/SkipNotification.js'
import { Kitchen } from '../models/Kitchen.js'
import { User } from '../models/User.js'
import { UserActivity } from '../models/UserActivity.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { HttpError } from '../middleware/error.js'
import { parseBody } from '../lib/validate.js'
import { reviewPaymentSchema, updateSubscriberStatusSchema } from '../lib/schemas.js'
import { ACTIVE_WINDOW_MS, PLAN_PRICE } from './subscription.js'
import { serializePayment } from './payments.js'

const router = Router()
router.use(requireAuth, requireAdmin)

/* GET /api/admin/overview
 *
 * KPIs exclude pending_payment subscribers (they haven't paid yet) and
 * derive "paused" from the orthogonal `pause` field, not the status enum
 * — model statuses are pending_payment | active | expired but the admin
 * mental model still wants active vs. paused vs. churned.
 */
router.get('/overview', async (_req, res) => {
  const [subs, kitchens, skipNotifications, totalUsers, recentActivities] = await Promise.all([
    Subscription.find({ status: { $ne: 'pending_payment' } })
      .populate('userId', 'name phone address pgName rating allergens'),
    Kitchen.find().sort({ area: 1 }),
    SkipNotification.find().sort({ requestedAt: -1 }).limit(50),
    User.countDocuments({}),
    UserActivity.find().sort({ at: -1 }).limit(20),
  ])

  const active = subs.filter((s) => s.status === 'active' && !s.pause).length
  const paused = subs.filter((s) => s.status === 'active' && !!s.pause).length
  const monthRevenue = subs.reduce((sum, s) => {
    if (s.status !== 'active') return sum
    return sum + PLAN_PRICE[s.planId] * 90
  }, 0)
  const ratings = await User.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }])
  const avgRating = ratings[0]?.avg ? Math.round(ratings[0].avg * 10) / 10 : 0

  res.json({
    kpis: {
      totalSubscribers: subs.length,
      totalUsers,
      active,
      paused,
      monthRevenue,
      avgRating,
    },
    kitchens: kitchens.map(serializeKitchen),
    skipNotifications: skipNotifications.map(serializeSkipNotification),
    recentActivities: recentActivities.map(serializeUserActivity),
  })
})

/* GET /api/admin/users
 *
 * Lists every registered user (subscribers + non-subscribers + admins). Used
 * for the new "Users" view in the admin dashboard so admins can see all data
 * collected at signup, including users who haven't subscribed yet.
 */
router.get('/users', async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json({
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone ?? '',
      picture: u.picture ?? '',
      isAdmin: !!u.isAdmin,
      area: u.address?.area ?? '',
      pgName: u.pgName ?? '',
      createdAt: u.get('createdAt')?.getTime?.() ?? 0,
    })),
  })
})

/* GET /api/admin/activities
 *
 * Recent auth-event log: register / login / profile_completed entries from
 * UserActivity. Polled by the admin Overview + Users pages so admins get a
 * live feed of new sign-ups and returning sign-ins.
 */
router.get('/activities', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 100)))
  const items = await UserActivity.find().sort({ at: -1 }).limit(limit)
  res.json({ activities: items.map(serializeUserActivity) })
})

/* GET /api/admin/subscribers
 *
 * Excludes pending_payment subscribers — those live in /api/admin/payments.
 * Status mapped to the admin's active|paused|churned vocabulary.
 */
router.get('/subscribers', async (_req, res) => {
  const subs = await Subscription.find({ status: { $ne: 'pending_payment' } })
    .populate('userId', 'name phone address pgName rating allergens createdAt')
  res.json({
    subscribers: subs.map((s) => {
      const u = s.userId as unknown as InstanceType<typeof User>
      const startedAt = s.startedAt
      const daysIn = Math.max(1, Math.floor((Date.now() - startedAt) / (24 * 60 * 60 * 1000)))
      return {
        id: String(s._id),
        userId: String(u._id),
        name: u.name,
        phone: u.phone,
        area: u.address?.area ?? 'Chennai',
        pgName: u.pgName ?? '',
        planId: s.planId,
        groupCode: s.groupCode,
        joinedAt: startedAt,
        daysIn,
        mealsServed: s.mealsServed,
        rating: u.rating ?? 4.5,
        status: mapToAdminStatus(s),
        allergens: u.allergens ?? [],
      }
    }),
  })
})

/* GET /api/admin/subscribers/:id */
router.get('/subscribers/:id', async (req, res) => {
  const s = await Subscription.findById(req.params.id).populate('userId')
  if (!s) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const u = s.userId as unknown as InstanceType<typeof User>
  res.json({
    subscriber: {
      id: String(s._id),
      userId: String(u._id),
      name: u.name,
      phone: u.phone,
      area: u.address?.area ?? 'Chennai',
      pgName: u.pgName ?? '',
      planId: s.planId,
      groupCode: s.groupCode,
      joinedAt: s.startedAt,
      daysIn: Math.max(1, Math.floor((Date.now() - s.startedAt) / (24 * 60 * 60 * 1000))),
      mealsServed: s.mealsServed,
      rating: u.rating ?? 4.5,
      status: mapToAdminStatus(s),
      allergens: u.allergens ?? [],
    },
  })
})

/* GET /api/admin/kitchens */
router.get('/kitchens', async (_req, res) => {
  const kitchens = await Kitchen.find().sort({ area: 1 })
  res.json({ kitchens: kitchens.map(serializeKitchen) })
})

/* GET /api/admin/skip-notifications */
router.get('/skip-notifications', async (_req, res) => {
  const items = await SkipNotification.find().sort({ requestedAt: -1 }).limit(100)
  res.json({ skipNotifications: items.map(serializeSkipNotification) })
})

/* PATCH /api/admin/subscribers/:id/status { status }
 *
 * Admin sends "active" | "paused" | "churned"; we map to the underlying
 * model fields (status + pause). "paused" toggles the pause window without
 * touching the lifecycle status; "churned" forces `expired`.
 */
router.patch('/subscribers/:id/status', async (req, res) => {
  const { status } = parseBody(updateSubscriberStatusSchema, req)
  const s = await Subscription.findById(req.params.id)
  if (!s) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (status === 'active') {
    s.status = 'active'
    s.pause = null
  } else if (status === 'paused') {
    s.status = 'active'
    // 7-day default pause window — admin can adjust later via the user pause endpoint.
    const now = Date.now()
    s.pause = { from: now, to: now + 7 * 24 * 60 * 60 * 1000 }
  } else if (status === 'churned') {
    s.status = 'expired'
    s.pause = null
  }
  await s.save()
  res.json({ ok: true })
})

/**
 * Translate the underlying Subscription model status into the admin's
 * mental-model status (active | paused | churned). Used everywhere the
 * admin lists or inspects a subscriber.
 *   model `pending_payment` shouldn't reach this fn (filtered upstream).
 */
function mapToAdminStatus(s: InstanceType<typeof Subscription>): 'active' | 'paused' | 'churned' {
  if (s.status === 'expired') return 'churned'
  if (s.status === 'active' && s.pause) return 'paused'
  return 'active'
}

/* ---------------------------------------------------------------------------
 * Payment verification queue
 * ------------------------------------------------------------------------- */

/**
 * GET /api/admin/payments?status=pending_verification
 *
 * Lists payment submissions joined with the subscriber's basic info so the
 * queue page has everything it needs without N+1 follow-up calls.
 * Defaults to pending_verification — pass ?status=approved or ?status=rejected
 * or ?status=all to see history.
 */
router.get('/payments', async (req, res) => {
  const allowed = ['pending_verification', 'approved', 'rejected', 'all'] as const
  const requested = String(req.query.status ?? 'pending_verification')
  const filter = (allowed as readonly string[]).includes(requested) ? requested : 'pending_verification'

  const query = filter === 'all' ? {} : { status: filter }
  const payments = await Payment.find(query)
    .sort({ submittedAt: -1 })
    .populate('userId', 'name phone address pgName')
    .limit(200)

  res.json({
    payments: payments.map((p) => {
      const u = p.userId as unknown as InstanceType<typeof User>
      return {
        ...serializePayment(p),
        planId: p.planId,
        billingCycleId: p.billingCycleId,
        expiresAt: p.expiresAt,
        user: u
          ? {
              id: String(u._id),
              name: u.name,
              phone: u.phone,
              area: u.address?.area ?? 'Chennai',
              pgName: u.pgName ?? '',
            }
          : null,
      }
    }),
  })
})

/**
 * POST /api/admin/payments/:id/approve
 *
 * Flips Payment → approved, Subscription → active with a 30-day window,
 * resets today's three meal statuses, and writes an immutable audit row.
 * Idempotent: calling approve on an already-approved payment is a no-op.
 */
router.post('/payments/:id/approve', async (req, res) => {
  const adminId = req.auth!.uid
  const admin = await User.findById(adminId)
  if (!admin) throw new HttpError(401, 'Admin user vanished')

  const payment = await Payment.findById(req.params.id)
  if (!payment) throw new HttpError(404, 'Payment not found')

  // Idempotency — already approved? return current state.
  if (payment.status === 'approved') {
    res.json({ payment: serializePayment(payment) })
    return
  }
  if (payment.status === 'rejected') {
    throw new HttpError(409, 'Payment was already rejected — cannot approve')
  }

  const sub = await Subscription.findById(payment.subscriptionId)
  if (!sub) throw new HttpError(404, 'Linked subscription not found')

  const now = Date.now()

  payment.status = 'approved'
  payment.reviewedAt = now
  payment.reviewedBy = admin._id
  payment.rejectionReason = null
  await payment.save()

  sub.status = 'active'
  sub.startedAt = now
  sub.cycleStartedAt = now
  sub.expiresAt = now + ACTIVE_WINDOW_MS
  sub.today = { breakfast: 'pending', lunch: 'pending', dinner: 'pending' }
  sub.paymentId = payment._id
  await sub.save()

  await PaymentAudit.create({
    paymentId: payment._id,
    subscriptionId: sub._id,
    adminId: admin._id,
    adminName: admin.name,
    action: 'approved',
    reason: null,
    snapshot: {
      utr: payment.utr,
      amount: payment.amount,
      screenshotUrl: payment.screenshotUrl,
      submittedAt: payment.submittedAt,
    },
    at: now,
  })

  res.json({ payment: serializePayment(payment) })
})

/**
 * POST /api/admin/payments/:id/reject  { reason? }
 *
 * Flips Payment → rejected with the supplied reason. The Subscription stays
 * in pending_payment so the user can submit a fresh payment with a different
 * UTR.
 */
router.post('/payments/:id/reject', async (req, res) => {
  const { reason } = parseBody(reviewPaymentSchema, req)
  const adminId = req.auth!.uid
  const admin = await User.findById(adminId)
  if (!admin) throw new HttpError(401, 'Admin user vanished')

  const payment = await Payment.findById(req.params.id)
  if (!payment) throw new HttpError(404, 'Payment not found')

  if (payment.status === 'rejected') {
    res.json({ payment: serializePayment(payment) })
    return
  }
  if (payment.status === 'approved') {
    throw new HttpError(409, 'Payment was already approved — cannot reject')
  }

  const now = Date.now()
  payment.status = 'rejected'
  payment.reviewedAt = now
  payment.reviewedBy = admin._id
  payment.rejectionReason = reason ?? 'Payment rejected by admin'
  await payment.save()

  await PaymentAudit.create({
    paymentId: payment._id,
    subscriptionId: payment.subscriptionId,
    adminId: admin._id,
    adminName: admin.name,
    action: 'rejected',
    reason: reason ?? null,
    snapshot: {
      utr: payment.utr,
      amount: payment.amount,
      screenshotUrl: payment.screenshotUrl,
      submittedAt: payment.submittedAt,
    },
    at: now,
  })

  res.json({ payment: serializePayment(payment) })
})

/**
 * GET /api/admin/payments/:id/audit
 *
 * Audit trail for a single payment — every approve/reject decision in order.
 */
router.get('/payments/:id/audit', async (req, res) => {
  const rows = await PaymentAudit.find({ paymentId: req.params.id }).sort({ at: -1 })
  res.json({
    audit: rows.map((r) => ({
      id: String(r._id),
      action: r.action,
      reason: r.reason,
      adminName: r.adminName,
      at: r.at,
    })),
  })
})

/* ------------------------------------------------------------------------- */

function serializeKitchen(k: InstanceType<typeof Kitchen>) {
  return {
    id: String(k._id),
    code: k.code,
    name: k.name,
    area: k.area,
    chef: k.chef,
    chefPhone: k.chefPhone,
    capacityPerDay: k.capacityPerDay,
    todaysLoad: k.todaysLoad,
    rating: k.rating,
    specialty: k.specialty,
    fssaiGrade: k.fssaiGrade,
  }
}

function serializeSkipNotification(n: InstanceType<typeof SkipNotification>) {
  return {
    id: String(n._id),
    kind: n.kind,
    subscriberId: String(n.userId),
    subscriberName: n.subscriberName,
    groupCode: n.groupCode,
    date: n.date,
    slot: n.slot,
    requestedAt: n.requestedAt,
  }
}

function serializeUserActivity(a: InstanceType<typeof UserActivity>) {
  return {
    id: String(a._id),
    userId: String(a.userId),
    kind: a.kind,
    name: a.name,
    email: a.email,
    phone: a.phone ?? '',
    ipAddress: a.ipAddress ?? '',
    userAgent: a.userAgent ?? '',
    at: a.at,
  }
}

export default router
