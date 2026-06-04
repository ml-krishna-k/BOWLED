import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * User identity.
 *
 * Auth is Google OAuth — keyed on `googleSub` (Google's stable user id).
 * `email` is the secondary identifier (also unique).
 *
 * `phone` is OPTIONAL — collected later in the profile screen for delivery.
 * Because it's optional under Google OAuth, the historical unique index on
 * `phone` would collide on the first two Google signups (both have no
 * phone). We use a *partial* unique index instead: only documents where
 * `phone` is a non-empty string are indexed for uniqueness.
 *
 *   IMPORTANT — if you're upgrading from the OTP era, the legacy `phone_1`
 *   index is still on the collection and will keep colliding until you
 *   drop it. Run `npm --prefix server run fix:phone-index` once.
 */
const UserSchema = new Schema(
  {
    /** Google's stable user id (the `sub` claim on the ID token). */
    googleSub: { type: String, required: true, unique: true, index: true },
    /** Verified email returned by Google. Used for admin matching + support. */
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    /** Google profile picture URL. */
    picture: { type: String, default: '' },

    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    /**
     * Optional. Left UNSET by default (not '' — empty string is a real
     * value and would collide on the unique partial index for everyone
     * who hasn't added a phone yet). User updates this from the profile
     * screen when they subscribe and we need a delivery contact.
     */
    phone: { type: String, trim: true },

    address: {
      line1: { type: String, default: 'Add your address' },
      area: { type: String, default: 'Chennai' },
      city: { type: String, default: 'Chennai' },
    },
    pgName: { type: String, default: '' },
    allergens: { type: [String], default: [] },
    parentReport: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

// Partial unique index on phone — only indexes rows where phone is a
// non-empty string. Multiple users with no phone (or phone === '') don't
// trip the unique constraint, but two real phones can't collide.
UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $type: 'string', $gt: '' } },
  },
)

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string }
export const User = model('User', UserSchema)
