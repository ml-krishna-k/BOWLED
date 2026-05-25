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
  phone: string
  name: string
  email?: string
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

export interface Subscription {
  planId: Plan['id']
  groupCode: string
  groupSize: number
  startedAt: number
  cycleStartedAt: number
  billingCycleId: 'weekly' | 'weekly-no-sun' | 'monthly-no-sun' | 'monthly-no-weekend'
  totalMeals: number
  mealsServed: number
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
