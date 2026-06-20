import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Auth-event log surfaced as admin notifications.
 *
 * Each row captures a register or login event so admins can see exactly
 * who came through and when, without trawling server logs. We snapshot
 * the user fields (name/email/phone) at the time of the event — that way
 * the activity feed stays meaningful even if the user later renames
 * themselves or changes their number.
 *
 * `kind`:
 *   - 'register' — first time we see this Google sub (new User doc created)
 *   - 'login'    — returning user (existing Google sub)
 *   - 'profile_completed' — user added their phone after a register/login
 *
 * IP + user-agent are best-effort fields for triage; missing on local dev.
 */
const UserActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: {
      type: String,
      enum: ['register', 'login', 'profile_completed'],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    /** May be empty for users who haven't added a phone yet. */
    phone: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    /** Stored as epoch ms so client code matches our existing `requestedAt` pattern. */
    at: { type: Number, required: true, index: true },
  },
  { timestamps: false },
)

UserActivitySchema.index({ at: -1 })

export type UserActivityDoc = InferSchemaType<typeof UserActivitySchema>
export const UserActivity = model('UserActivity', UserActivitySchema)
