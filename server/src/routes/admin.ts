import { Router } from 'express'
import { Subscription } from '../models/Subscription.js'
import { SkipNotification } from '../models/SkipNotification.js'
import { Kitchen } from '../models/Kitchen.js'
import { User } from '../models/User.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { parseBody } from '../lib/validate.js'
import { updateSubscriberStatusSchema } from '../lib/schemas.js'
import { PLAN_PRICE } from './subscription.js'

const router = Router()
router.use(requireAuth, requireAdmin)

/* GET /api/admin/overview */
router.get('/overview', async (_req, res) => {
  const [subs, kitchens, skipNotifications] = await Promise.all([
    Subscription.find().populate('userId', 'name phone address pgName rating allergens'),
    Kitchen.find().sort({ area: 1 }),
    SkipNotification.find().sort({ requestedAt: -1 }).limit(50),
  ])

  const active = subs.filter((s) => s.status === 'active').length
  const paused = subs.filter((s) => s.status === 'paused').length
  const monthRevenue = subs.reduce((sum, s) => {
    if (s.status !== 'active') return sum
    return sum + PLAN_PRICE[s.planId] * 90
  }, 0)
  const ratings = await User.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }])
  const avgRating = ratings[0]?.avg ? Math.round(ratings[0].avg * 10) / 10 : 0

  res.json({
    kpis: {
      totalSubscribers: subs.length,
      active,
      paused,
      monthRevenue,
      avgRating,
    },
    kitchens: kitchens.map(serializeKitchen),
    skipNotifications: skipNotifications.map(serializeSkipNotification),
  })
})

/* GET /api/admin/subscribers */
router.get('/subscribers', async (_req, res) => {
  const subs = await Subscription.find().populate('userId', 'name phone address pgName rating allergens createdAt')
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
        status: s.status,
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
      status: s.status,
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

/* PATCH /api/admin/subscribers/:id/status { status } */
router.patch('/subscribers/:id/status', async (req, res) => {
  const { status } = parseBody(updateSubscriberStatusSchema, req)
  const s = await Subscription.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!s) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json({ ok: true })
})

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

export default router
