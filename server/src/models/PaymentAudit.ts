import { Schema, model, type InferSchemaType, Types } from 'mongoose'

/**
 * Immutable audit trail for payment review actions.
 *
 * One row per admin approve/reject — we never update or delete these. Use
 * to answer "who approved this payment, when, why was that one rejected".
 */
const ActionEnum = ['approved', 'rejected'] as const

const PaymentAuditSchema = new Schema(
  {
    paymentId:    { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    /** The Subscription this payment belongs to. Denormalised for easy joins. */
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
    /** Admin who took the action. */
    adminId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminName:    { type: String, required: true },

    action:       { type: String, enum: ActionEnum, required: true },
    reason:       { type: String, default: null },

    /** Snapshot of the payment at decision time (immutable record). */
    snapshot: {
      utr:           { type: String, required: true },
      amount:        { type: Number, required: true },
      screenshotUrl: { type: String, required: true },
      submittedAt:   { type: Number, required: true },
    },

    at: { type: Number, required: true, index: true },
  },
  // No timestamps — `at` is the canonical time. Audit rows are write-once.
  { timestamps: false },
)

export type PaymentAuditDoc = InferSchemaType<typeof PaymentAuditSchema> & { _id: Types.ObjectId }
export const PaymentAudit = model('PaymentAudit', PaymentAuditSchema)
export { ActionEnum as PaymentAuditActionEnum }
