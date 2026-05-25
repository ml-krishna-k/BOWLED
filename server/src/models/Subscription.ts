import { Schema, model, type InferSchemaType, Types } from 'mongoose'

const MealStatusEnum = ['pending', 'served', 'skipped'] as const
const SlotEnum = ['breakfast', 'lunch', 'dinner'] as const
const PlanEnum = ['solo', 'squad', 'floor'] as const
const CycleEnum = ['weekly', 'weekly-no-sun', 'monthly-no-sun', 'monthly-no-weekend'] as const
const StatusEnum = ['active', 'paused', 'churned'] as const

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
    billingCycleId: { type: String, enum: CycleEnum, default: 'monthly-no-sun' },
    groupCode: { type: String, required: true, index: true },
    groupSize: { type: Number, default: 1 },
    startedAt: { type: Number, required: true },
    cycleStartedAt: { type: Number, required: true },
    totalMeals: { type: Number, required: true },
    mealsServed: { type: Number, default: 0 },
    status: { type: String, enum: StatusEnum, default: 'active' },
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
