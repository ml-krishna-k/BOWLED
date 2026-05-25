import { Schema, model, type InferSchemaType } from 'mongoose'

const UserSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    isAdmin: { type: Boolean, default: false },
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

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string }
export const User = model('User', UserSchema)
