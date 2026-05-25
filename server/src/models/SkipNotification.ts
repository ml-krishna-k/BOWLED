import { Schema, model, type InferSchemaType } from 'mongoose'

const SkipNotificationSchema = new Schema(
  {
    kind: { type: String, enum: ['meal', 'day'], required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriberName: { type: String, required: true },
    groupCode: { type: String, required: true },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    slot: { type: String, enum: ['breakfast', 'lunch', 'dinner'] },
    requestedAt: { type: Number, required: true },
  },
  { timestamps: true },
)

SkipNotificationSchema.index({ requestedAt: -1 })

export type SkipNotificationDoc = InferSchemaType<typeof SkipNotificationSchema>
export const SkipNotification = model('SkipNotification', SkipNotificationSchema)
