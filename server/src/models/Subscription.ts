import { Schema, model, type InferSchemaType, Types } from 'mongoose'

const MealStatusEnum = ['pending', 'served', 'skipped'] as const
const SlotEnum = ['breakfast', 'lunch', 'dinner'] as const
const PlanEnum = ['solo', 'squad', 'floor'] as const
const CycleEnum = [
  'weekly',
  'weekly-no-sun',
  'weekly-no-weekend',
  'monthly-31',
  'monthly-no-sun',
  'monthly-no-weekend',
  'dinner-weekly',
  'dinner-monthly',
] as const

/**
 * Subscription lifecycle:
 *   pending_payment → active → expired
 *
 * `pending_payment`  — created when the user picks a plan; sits here until
 *                      an admin approves their UPI payment.
 * `active`           — admin approved the payment; plan is live. 30-day
 *                      window (extended for skips/pauses) tracked via
 *                      `expiresAt`.
 * `expired`          — `expiresAt` elapsed without renewal. The doc stays
 *                      around for history but no scans / skips are allowed.
 *
 * Pause is a separate orthogonal field (`pause: { from, to }`) — a paused
 * subscription is still `active`.
 */
const StatusEnum = ['pending_payment', 'active', 'expired'] as const

const ServedMealSchema = new Schema(
  {
    scannedAt: { type: Number, required: true },
    day: { type: Number, required: true },
    slot: { type: String, enum: SlotEnum, required: true },
    mealName: { type: String, required: true },
  },
  { _id: false },
)

const SkippedMealSchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    slot: { type: String, enum: SlotEnum, required: true },
    requestedAt: { type: Number, required: true },
  },
  { _id: false },
)

const SkippedDaySchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    requestedAt: { type: Number, required: true },
  },
  { _id: false },
)

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    planId: { type: String, enum: PlanEnum, required: true },
    billingCycleId: { type: String, enum: CycleEnum, default: 'monthly-31' },
    groupCode: { type: String, required: true, index: true },
    groupSize: { type: Number, default: 1 },

    /**
     * Started + cycleStarted are set when the admin APPROVES the payment.
     * Before that the sub is in `pending_payment` and these are 0.
     */
    startedAt: { type: Number, default: 0 },
    cycleStartedAt: { type: Number, default: 0 },
    /** When the active window ends. Set on approval to now + 30 days. */
    expiresAt: { type: Number, default: 0 },

    /** Pointer to the most recent approved Payment doc, for audit. */
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },

    totalMeals: { type: Number, required: true },
    mealsServed: { type: Number, default: 0 },
    status: { type: String, enum: StatusEnum, default: 'pending_payment', index: true },
    today: {
      breakfast: { type: String, enum: MealStatusEnum, default: 'pending' },
      lunch:     { type: String, enum: MealStatusEnum, default: 'pending' },
      dinner:    { type: String, enum: MealStatusEnum, default: 'pending' },
    },
    history: { type: [ServedMealSchema], default: [] },
    pause: {
      type: { from: Number, to: Number },
      default: null,
    },
    mealSkips: { type: [SkippedMealSchema], default: [] },
    daySkips: { type: [SkippedDaySchema], default: [] },
  },
  { timestamps: true },
)

export type SubscriptionDoc = InferSchemaType<typeof SubscriptionSchema> & {
  _id: Types.ObjectId
  userId: Types.ObjectId
}
export const Subscription = model('Subscription', SubscriptionSchema)

export { PlanEnum, CycleEnum, SlotEnum, MealStatusEnum, StatusEnum }
