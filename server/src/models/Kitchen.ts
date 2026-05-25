import { Schema, model, type InferSchemaType } from 'mongoose'

const KitchenSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    area: { type: String, required: true, index: true },
    chef: { type: String, required: true },
    chefPhone: { type: String, required: true },
    capacityPerDay: { type: Number, required: true },
    todaysLoad: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    specialty: { type: String, default: '' },
    fssaiGrade: { type: String, enum: ['A', 'B'], default: 'A' },
  },
  { timestamps: true },
)

export type KitchenDoc = InferSchemaType<typeof KitchenSchema>
export const Kitchen = model('Kitchen', KitchenSchema)
