export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface Meal {
  id: string
  name: string
  description: string
  calories: number
  isVeg: boolean
  rating: number
  tags: string[]
  loved?: boolean
  /** Cloudinary URL uploaded by admin. Optional — falls back to a gradient placeholder. */
  imageUrl?: string
}

export interface DayMenu {
  day: string
  short: string
  meals: Record<MealSlot, Meal>
}

export interface Plan {
  id: 'solo' | 'squad' | 'floor'
  name: string
  groupSize: string
  groupMin: number
  pricePerMeal: number
  monthlyPrice: number
  meals: number
  savingPerMeal: number
  savingPerMonth: number
  perks: string[]
  highlight?: string
  recommended?: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  initials: string
  city: string
}

export interface FaqItem {
  q: string
  a: string
}

/* ---------------------------------------------------------------------------
 * Auth & subscription (app state)
 * ------------------------------------------------------------------------- */

export interface User {
  id: string
  email: string
  name: string
  /** Google profile picture URL. Empty if Google didn't return one. */
  picture?: string
  /** Optional — collected later for delivery. Empty string when not set. */
  phone?: string
  isAdmin?: boolean
  address: {
    line1: string
    area: string
    city: 'Chennai'
  }
  allergens: string[]
  parentReport: boolean
  notifications: boolean
  createdAt: number
}

/* ---------------------------------------------------------------------------
 * Admin-side mock data
 * ------------------------------------------------------------------------- */

export type SubscriberStatus = 'active' | 'paused' | 'churned'

export interface Subscriber {
  id: string
  /** User._id (distinct from the subscription _id stored in `id`). Skip
   *  notifications and QR-redeem responses reference the user, so the admin
   *  Deliveries page joins by this field. */
  userId?: string
  name: string
  phone: string
  area: string
  pgName: string
  planId: Plan['id']
  groupCode: string
  joinedAt: number
  daysIn: number
  mealsServed: number
  rating: number
  status: SubscriberStatus
  allergens: string[]
}

export interface Kitchen {
  id: string
  name: string
  area: string
  chef: string
  chefPhone: string
  capacityPerDay: number
  todaysLoad: number
  rating: number
  specialty: string
  fssaiGrade: 'A' | 'B'
}

export interface AdminGroup {
  code: string
  members: number
  planId: Plan['id']
  monthlySavings: number
  area: string
}

export type DeliveryStatus = 'pending' | 'served' | 'skipped'

export interface Delivery {
  id: string
  subscriberId: string
  /** User._id of the customer this delivery belongs to. Used by the in-app
   *  scanner to find the matching delivery row after a successful redeem
   *  (QR /redeem returns the user id). */
  userId?: string
  subscriberName: string
  area: string
  pgName: string
  slot: MealSlot
  mealName: string
  isVeg: boolean
  status: DeliveryStatus
  kitchenId: string
  scheduledAt: string // "13:00" etc
}

export type MealStatus = 'pending' | 'served' | 'skipped'

export interface ServedMeal {
  scannedAt: number
  day: number
  slot: MealSlot
  mealName: string
}

export interface PauseWindow {
  from: number
  to: number
}

export interface SkippedMeal {
  id: string
  date: string // 'YYYY-MM-DD' (local)
  slot: MealSlot
  requestedAt: number
}

export interface SkippedDay {
  id: string
  date: string // 'YYYY-MM-DD' (local)
  requestedAt: number
}

export type SubscriptionStatus = 'pending_payment' | 'active' | 'expired'

export interface Subscription {
  planId: Plan['id']
  groupCode: string
  groupSize: number
  /** Set when admin approves payment; 0 while pending. */
  startedAt: number
  cycleStartedAt: number
  /** Set on approval to now + 30 days; 0 while pending. */
  expiresAt: number
  billingCycleId:
    | 'weekly'
    | 'weekly-no-sun'
    | 'weekly-no-weekend'
    | 'monthly-31'
    | 'monthly-no-sun'
    | 'monthly-no-weekend'
    | 'dinner-weekly'
    | 'dinner-monthly'
  totalMeals: number
  mealsServed: number
  status: SubscriptionStatus
  today: {
    breakfast: MealStatus
    lunch: MealStatus
    dinner: MealStatus
  }
  history: ServedMeal[]
  pause: PauseWindow | null
  mealSkips: SkippedMeal[]
  daySkips: SkippedDay[]
}

/* ---------------------------------------------------------------------------
 * Manual UPI payment flow
 * ------------------------------------------------------------------------- */

export type PaymentStatus = 'pending_verification' | 'approved' | 'rejected'

export interface PaymentInstructions {
  /** Stable per-subscription reference shown in the UPI QR + form. */
  orderRef: string
  amount: number
  upiId: string
  businessName: string
  /** upi:// URL ready to drop into QRCodeSVG. */
  upiUri: string
  /** Window to submit screenshot + UTR before subscription auto-expires. */
  submitExpiresAt: number
}

export interface PaymentRecord {
  id: string
  orderRef: string
  amount: number
  utr: string
  screenshotUrl: string
  status: PaymentStatus
  submittedAt: number
  reviewedAt: number | null
  rejectionReason: string | null
}

export type SkipKind = 'meal' | 'day'

export interface AdminSkipNotification {
  id: string
  kind: SkipKind
  subscriberId: string
  subscriberName: string
  groupCode: string
  date: string // 'YYYY-MM-DD'
  slot?: MealSlot // only for 'meal'
  requestedAt: number
}

/* ---------------------------------------------------------------------------
 * Admin: full user list + auth-event log
 * ------------------------------------------------------------------------- */

/** A registered user as surfaced on the admin "Users" page. Includes everyone
 *  — subscribers and non-subscribers — since the admin needs visibility on
 *  details collected at signup, not just paying customers. */
export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  picture: string
  isAdmin: boolean
  area: string
  pgName: string
  createdAt: number
}

export type UserActivityKind = 'register' | 'login' | 'profile_completed'

/** One auth event. Used to render the admin notification feed for new
 *  registrations / logins. */
export interface UserActivity {
  id: string
  userId: string
  kind: UserActivityKind
  name: string
  email: string
  phone: string
  ipAddress: string
  userAgent: string
  at: number
}
