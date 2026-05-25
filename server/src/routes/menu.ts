import { Router } from 'express'
import { MenuOverride } from '../models/MenuOverride.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { parseBody } from '../lib/validate.js'
import { menuOverrideSchema } from '../lib/schemas.js'
import { HttpError } from '../middleware/error.js'

const router = Router()

/* PUBLIC: GET /api/menu/overrides — read-only, used by the public WeeklyMenu
 * and the admin menu editor to overlay onto the hardcoded WEEKLY_MENU. */
router.get('/overrides', async (_req, res) => {
  const items = await MenuOverride.find().lean()
  res.json({
    overrides: items.map((o) => ({
      dayIdx: o.dayIdx,
      slot: o.slot,
      name: o.name,
      description: o.description,
      calories: o.calories,
      rating: o.rating,
      isVeg: o.isVeg,
      loved: o.loved,
      tags: o.tags,
      imageUrl: o.imageUrl,
    })),
  })
})

/* ADMIN: PATCH /api/menu/admin/:dayIdx/:slot — upsert override */
router.patch('/admin/:dayIdx/:slot', requireAuth, requireAdmin, async (req, res) => {
  const dayIdx = Number(req.params.dayIdx)
  const slot = req.params.slot
  if (!Number.isInteger(dayIdx) || dayIdx < 0 || dayIdx > 6) {
    throw new HttpError(400, 'dayIdx must be an integer 0–6')
  }
  if (slot !== 'breakfast' && slot !== 'lunch' && slot !== 'dinner') {
    throw new HttpError(400, 'slot must be breakfast | lunch | dinner')
  }
  const patch = parseBody(menuOverrideSchema, req)
  const doc = await MenuOverride.findOneAndUpdate(
    { dayIdx, slot },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  res.json({
    override: {
      dayIdx: doc.dayIdx,
      slot: doc.slot,
      name: doc.name,
      description: doc.description,
      calories: doc.calories,
      rating: doc.rating,
      isVeg: doc.isVeg,
      loved: doc.loved,
      tags: doc.tags,
      imageUrl: doc.imageUrl,
    },
  })
})

export default router
