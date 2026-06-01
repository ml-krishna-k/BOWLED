import { Schema, model, type InferSchemaType, Types } from 'mongoose'
import { PlanEnum, CycleEnum } from './Subscription.js'

/**
 * Manual UPI payment submission.
 *
 * Lifecycle:
 *   pending_verification → approved | rejected
 *
 * On approval the linked Subscription flips to `active` with a 30-day window.
 * On rejection the subscription stays in `pending_payment` so the user can
 * submit a fresh payment (with a different UTR — UTRs are unique globally).
 */
const StatusEnum = ['pending_verification', 'approved', 'rejected'] as const

const PaymentSchema = new Schema(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User',         required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },

    planId:         { type: String, enum: PlanEnum,  required: true },
    billingCycleId: { type: String, enum: CycleEnum, required: true },

    /** Per-subscription human-friendly reference shown in the UPI QR + UI. */
    orderRef:  { type: String, required: true, unique: true, index: true },
    /** Amount in rupees (whole-number INR). Computed server-side at order creation. */
    amount:    { type: Number, required: true, min: 1 },
    currency:  { type: String, default: 'INR' },

    /** Bank's Unique Transaction Reference for the UPI payment. Globally unique. */
    utr:            { type: String, required: true, unique: true, index: true },
    /** Cloudinary secure_url of the user-uploaded payment screenshot. */
    screenshotUrl:  { type: String, required: true },

    status:         { type: String, enum: StatusEnum, default: 'pending_verification', index: true },
    submittedAt:    { type: Number, required: true },
    /** When this pending payment auto-expires if no admin acts. */
    expiresAt:      { type: Number, required: true },
    reviewedAt:     { type: Number, default: null },
    reviewedBy:     { type: Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason:{ type: String, default: null },
  },
  { timestamps: true },
)

export type PaymentDoc = InferSchemaType<typeof PaymentSchema> & { _id: Types.ObjectId }
export const Payment = model('Payment', PaymentSchema)
export { StatusEnum as PaymentStatusEnum }
