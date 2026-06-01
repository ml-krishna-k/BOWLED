import { Router } from 'express'
import { Payment } from '../models/Payment.js'
import { Subscription } from '../models/Subscription.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../middleware/error.js'
import { parseBody } from '../lib/validate.js'
import { submitPaymentSchema } from '../lib/schemas.js'
import { buildOrderRef, totalForPlan } from './subscription.js'

const router = Router()
router.use(requireAuth)

/** Window the admin has to review a submitted payment before it auto-rejects. */
const VERIFICATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/* ---------------------------------------------------------------------------
 * POST /api/payments
 *
 * The user has paid via UPI and is uploading their evidence (screenshot URL
 * from Cloudinary + bank UTR). Creates a Payment doc in `pending_verification`.
 *
 * Guards:
 *   - The user must have a Subscription in `pending_payment` status.
 *   - The UTR must be globally unique (Mongo unique index enforces this; we
 *     check first for a clean 409 instead of a noisy duplicate-key error).
 *   - The submit window (48h from sub creation) must not have elapsed.
 * ------------------------------------------------------------------------- */
router.post('/', async (req, res) => {
  const { utr, screenshotUrl } = parseBody(submitPaymentSchema, req)
  const uid = req.auth!.uid

  const sub = await Subscription.findOne({ userId: uid })
  if (!sub) throw new HttpError(404, 'No subscription found — pick a plan first', { reason: 'no-subscription' })
  if (sub.status !== 'pending_payment') {
    throw new HttpError(409, 'No pending payment on this subscription', { reason: 'not-pending' })
  }

  // Submit window check — derive from createdAt via timestamps.
  const subCreatedAt = (sub as { createdAt?: Date }).createdAt?.getTime() ?? 0
  const SUBMIT_WINDOW_MS = 48 * 60 * 60 * 1000
  if (subCreatedAt > 0 && Date.now() - subCreatedAt > SUBMIT_WINDOW_MS) {
    sub.status = 'expired'
    await sub.save()
    throw new HttpError(409, 'Payment window has expired — please start a new subscription', { reason: 'submit-expired' })
  }

  // UTR uniqueness — anyone in the system who used this UTR blocks it. Returns
  // a clean 409 instead of letting Mongo throw a duplicate-key error.
  const dup = await Payment.findOne({ utr })
  if (dup) {
    throw new HttpError(409, 'This UTR has already been used. Each UTR can only be submitted once.', { reason: 'duplicate-utr' })
  }

  // Block resubmits while one is already pending review for this sub.
  const existingPending = await Payment.findOne({ subscriptionId: sub._id, status: 'pending_verification' })
  if (existingPending) {
    throw new HttpError(409, 'A payment is already pending verification for this subscription', { reason: 'already-pending' })
  }

  const now = Date.now()
  const orderRef = buildOrderRef(sub._id.toString())
  const amount = totalForPlan(sub.planId, sub.billingCycleId)

  const payment = await Payment.create({
    userId: uid,
    subscriptionId: sub._id,
    planId: sub.planId,
    billingCycleId: sub.billingCycleId,
    orderRef,
    amount,
    currency: 'INR',
    utr,
    screenshotUrl,
    status: 'pending_verification',
    submittedAt: now,
    expiresAt: now + VERIFICATION_WINDOW_MS,
  })

  res.status(201).json({ payment: serializePayment(payment) })
})

/* ---------------------------------------------------------------------------
 * GET /api/payments/mine
 *
 * The current user's payment submissions, most recent first. Lets the
 * "pending verification" / "rejected, try again" screens show status.
 * ------------------------------------------------------------------------- */
router.get('/mine', async (req, res) => {
  const items = await Payment.find({ userId: req.auth!.uid }).sort({ submittedAt: -1 })
  res.json({ payments: items.map(serializePayment) })
})

/* ---------- Helpers ------------------------------------------------------- */

export function serializePayment(p: InstanceType<typeof Payment>) {
  return {
    id: String(p._id),
    orderRef: p.orderRef,
    amount: p.amount,
    utr: p.utr,
    screenshotUrl: p.screenshotUrl,
    status: p.status,
    submittedAt: p.submittedAt,
    reviewedAt: p.reviewedAt,
    rejectionReason: p.rejectionReason,
  }
}

export default router
