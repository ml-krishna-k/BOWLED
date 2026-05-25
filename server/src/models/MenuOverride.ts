import { Schema, model, type InferSchemaType } from 'mongoose'

/**
 * Sparse menu override keyed by (dayIdx, slot). Frontend merges these into the
 * hardcoded WEEKLY_MENU baseline — only the fields present here are applied,
 * leaving the rest at default. Lets admin edit any meal field (including the
 * Cloudinary image URL) without bulk-seeding the full menu into Mongo.
 */
const MenuOverrideSchema = new Schema(
  {
    dayIdx: { type: Number, required: true, min: 0, max: 6 },
    slot: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner'] },
    name: { type: String, default: undefined },
    description: { type: String, default: undefined },
    calories: { type: Number, default: undefined },
    rating: { type: Number, default: undefined },
    isVeg: { type: Boolean, default: undefined },
    loved: { type: Boolean, default: undefined },
    tags: { type: [String], default: undefined },
    imageUrl: { type: String, default: undefined },
  },
  { timestamps: true },
)

MenuOverrideSchema.index({ dayIdx: 1, slot: 1 }, { unique: true })

export type MenuOverrideDoc = InferSchemaType<typeof MenuOverrideSchema>
export const MenuOverride = model('MenuOverride', MenuOverrideSchema)
