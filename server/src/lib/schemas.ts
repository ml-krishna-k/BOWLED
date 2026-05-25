import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{4,8}$/, 'OTP must be 4–8 digits')

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

const slotSchema = z.enum(['breakfast', 'lunch', 'dinner'])

const planIdSchema = z.enum(['solo', 'squad', 'floor'])
const billingCycleSchema = z.enum([
  'weekly',
  'weekly-no-sun',
  'monthly-no-sun',
  'monthly-no-weekend',
])
const subStatusSchema = z.enum(['active', 'paused', 'churned'])

/* ---------- Auth ---------- */

export const otpSendSchema = z.object({
  phone: phoneSchema,
})

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  name: z.string().trim().min(2, 'Name is too short').max(80).optional(),
})

/* ---------- Me ---------- */

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
    address: z
      .object({
        line1: z.string().trim().max(200).optional(),
        area: z.string().trim().max(80).optional(),
        city: z.literal('Chennai').optional(),
      })
      .partial()
      .optional(),
    pgName: z.string().trim().max(120).optional(),
    allergens: z.array(z.string().trim().max(60)).max(20).optional(),
    parentReport: z.boolean().optional(),
    notifications: z.boolean().optional(),
  })
  .strict()

/* ---------- Subscription ---------- */

export const createSubscriptionSchema = z.object({
  planId: planIdSchema,
  billingCycleId: billingCycleSchema.optional(),
  groupSize: z.number().int().min(1).max(50).optional(),
  groupCode: z.string().trim().min(3).max(40).optional(),
})

export const updateSubscriptionSchema = z.object({
  billingCycleId: billingCycleSchema.optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' })

export const scanSchema = z.object({
  slot: slotSchema.optional(),
  mealName: z.string().trim().max(120).optional(),
})

export const pauseSchema = z.object({
  fromIso: z.string().trim().min(8),
  toIso: z.string().trim().min(8),
})

export const skipMealSchema = z.object({
  date: dateSchema,
  slot: slotSchema,
})

export const skipDaySchema = z.object({
  date: dateSchema,
})

/* ---------- Admin ---------- */

export const updateSubscriberStatusSchema = z.object({
  status: subStatusSchema,
})

/* ---------- Group code ---------- */

/** Loose validator — accepts anything 3–40 chars to avoid breaking on legacy seeds. */
export const groupCodeParamSchema = z.object({
  code: z.string().trim().min(3).max(40),
})

/* ---------- Image upload ---------- */

export const uploadImageSchema = z.object({
  // data URI: data:image/{jpeg|png|webp|gif};base64,...
  data: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/, 'Expected a base64 image data URI')
    .max(8 * 1024 * 1024, 'Image too large (max ~6MB)'),
  folder: z.string().trim().max(120).optional(),
})

/* ---------- Menu override ---------- */

export const dayIdxSchema = z.coerce.number().int().min(0).max(6)

export const menuOverrideSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  calories: z.number().int().min(0).max(5000).optional(),
  rating: z.number().min(0).max(5).optional(),
  isVeg: z.boolean().optional(),
  loved: z.boolean().optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
  imageUrl: z.string().url().max(500).optional().or(z.literal('')),
}).refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' })
