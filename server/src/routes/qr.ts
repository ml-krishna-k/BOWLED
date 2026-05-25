import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Subscription } from '../models/Subscription.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../middleware/error.js'
import { parseBody } from '../lib/validate.js'
import { config } from '../config.js'

const router = Router()

interface QrTokenPayload {
  kind: 'qr-scan'
  uid: string
}

const QR_TOKEN_TTL_SECONDS = 60

/* GET /api/qr/token — authenticated user mints a short-lived (60s) scan token.
 * The frontend encodes this into the QR. Rotates every 30s on the client so
 * a stale screenshot can't be reused. */
router.get('/token', requireAuth, (req, res) => {
  const payload: QrTokenPayload = { kind: 'qr-scan', uid: req.auth!.uid }
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: QR_TOKEN_TTL_SECONDS })
  res.json({ token, expiresIn: QR_TOKEN_TTL_SECONDS })
})

const redeemSchema = z.object({
  token: z.string().min(10).max(2000),
  slot: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
  mealName: z.string().trim().max(120).optional(),
})

/* POST /api/qr/redeem — public (no Bearer auth needed). The signed token IS
 * the authorisation; only the holder of a freshly-issued QR can call this.
 * Used by the rider when they scan the QR. */
const SLOTS = ['breakfast', 'lunch', 'dinner'] as const
router.post('/redeem', async (req, res) => {
  const { token, slot, mealName } = parseBody(redeemSchema, req)

  let payload: QrTokenPayload
  try {
    payload = jwt.verify(token, config.jwtSecret) as QrTokenPayload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'QR has expired — ask the subscriber to refresh', { reason: 'expired' })
    }
    throw new HttpError(401, 'Invalid QR token', { reason: 'invalid' })
  }
  if (payload.kind !== 'qr-scan' || !payload.uid) {
    throw new HttpError(401, 'Wrong token type', { reason: 'wrong-kind' })
  }

  const sub = await Subscription.findOne({ userId: payload.uid })
  if (!sub) throw new HttpError(404, 'No active subscription', { reason: 'no-sub' })
  if (!sub.today) throw new HttpError(500, 'Subscription missing today state')
  if (sub.status !== 'active') {
    throw new HttpError(409, 'Subscription is not active', { reason: 'not-active' })
  }
  if (sub.mealsServed >= sub.totalMeals) {
    throw new HttpError(409, 'No meals left to serve', { reason: 'no-meals-left' })
  }

  const today = sub.today
  const target = slot ?? SLOTS.find((s) => today[s] === 'pending')
  if (!target) throw new HttpError(409, 'No pending meal to scan', { reason: 'none-pending' })
  if (today[target] !== 'pending') {
    throw new HttpError(409, `${target} is already ${today[target]}`, { reason: 'not-pending' })
  }

  today[target] = 'served'
  sub.mealsServed = (sub.mealsServed ?? 0) + 1
  sub.history.unshift({
    scannedAt: Date.now(),
    day: Math.max(1, Math.floor((Date.now() - sub.startedAt) / (24 * 60 * 60 * 1000)) + 1),
    slot: target,
    mealName: mealName ?? 'Meal',
  })
  while (sub.history.length > 50) sub.history.pop()
  await sub.save()

  res.json({
    ok: true,
    slot: target,
    mealsServed: sub.mealsServed,
    mealsRemaining: Math.max(0, sub.totalMeals - sub.mealsServed),
  })
})

export default router
