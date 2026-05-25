import type { Subscriber, Kitchen, AdminGroup, Plan } from '@/types'
import { PLANS } from './plans'

const FIRST = [
  'Aarav', 'Sneha', 'Karthik', 'Priya', 'Vikram', 'Anjali', 'Rohan', 'Divya',
  'Arjun', 'Meera', 'Aditya', 'Lakshmi', 'Sai', 'Pooja', 'Rahul', 'Ishita',
  'Nikhil', 'Ananya', 'Harish', 'Bhavana', 'Surya', 'Kavya', 'Manoj', 'Tara',
  'Yash', 'Riya', 'Akhil', 'Sruthi', 'Praveen', 'Nithya', 'Deepak', 'Janani',
  'Vignesh', 'Madhuri', 'Sanjay', 'Keerthi', 'Naveen', 'Sandhya', 'Hari', 'Anu',
]
const LAST = [
  'Mehta', 'Iyer', 'Reddy', 'Krishnan', 'Suresh', 'Subramaniam', 'Pillai',
  'Rangarajan', 'Sharma', 'Venkatesh', 'Murthy', 'Rao', 'Nair', 'Bhat',
  'Kumar', 'Raj', 'Nambiar', 'Srinivasan', 'Rajagopal', 'Chari',
]
const AREAS = [
  'Adyar', 'Velachery', 'OMR (Thoraipakkam)', 'T. Nagar', 'Anna Nagar',
  'Tambaram', 'Kotturpuram', 'Besant Nagar', 'Saidapet', 'Guindy',
]
const PG_PREFIX = ['Padmavathy', 'Saraswathi', 'Krishna', 'Lakshmi', 'Cauvery', 'Anand', 'Vinayaga', 'Sri Sai', 'Mahalakshmi']

const KITCHENS: Kitchen[] = [
  {
    id: 'k_adyar',
    name: 'Saraswathi Akka',
    area: 'Adyar',
    chef: 'Saraswathi Akka',
    chefPhone: '9840012001',
    capacityPerDay: 240,
    todaysLoad: 198,
    rating: 4.8,
    specialty: 'Tamil home cooking',
    fssaiGrade: 'A',
  },
  {
    id: 'k_vela',
    name: 'Padma Aunty',
    area: 'Velachery',
    chef: 'Padma Aunty',
    chefPhone: '9840012002',
    capacityPerDay: 220,
    todaysLoad: 180,
    rating: 4.7,
    specialty: 'South Indian classics',
    fssaiGrade: 'A',
  },
  {
    id: 'k_omr',
    name: 'Chef Anil',
    area: 'OMR (Thoraipakkam)',
    chef: 'Chef Anil',
    chefPhone: '9840012003',
    capacityPerDay: 300,
    todaysLoad: 252,
    rating: 4.6,
    specialty: 'North-South fusion',
    fssaiGrade: 'A',
  },
  {
    id: 'k_tnagar',
    name: 'Meera Akka',
    area: 'T. Nagar',
    chef: 'Meera Akka',
    chefPhone: '9840012004',
    capacityPerDay: 200,
    todaysLoad: 168,
    rating: 4.9,
    specialty: 'Chettinad & coastal',
    fssaiGrade: 'A',
  },
]

const AREA_TO_KITCHEN: Record<string, string> = {
  'Adyar': 'k_adyar',
  'Besant Nagar': 'k_adyar',
  'Kotturpuram': 'k_adyar',
  'Velachery': 'k_vela',
  'Guindy': 'k_vela',
  'Saidapet': 'k_vela',
  'OMR (Thoraipakkam)': 'k_omr',
  'Tambaram': 'k_omr',
  'T. Nagar': 'k_tnagar',
  'Anna Nagar': 'k_tnagar',
}

const GROUP_CODES = [
  'KF-ADY-7K2', 'KF-VEL-MQ4', 'KF-OMR-X9P', 'KF-TNG-A4R',
  'KF-ADY-B8L', 'KF-VEL-C2W', 'KF-OMR-D6Z', 'KF-TNG-E1M',
  'KF-AN1-F3N', 'KF-TAM-G5Q',
]

// Tiny deterministic PRNG so seed is stable across reloads
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedSubscribers(count = 42): Subscriber[] {
  const rand = mulberry32(20251101)
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
  const pickPlan = (): Plan['id'] => {
    const r = rand()
    if (r < 0.25) return 'solo'
    if (r < 0.8) return 'squad'
    return 'floor'
  }
  const subs: Subscriber[] = []
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const planId = pickPlan()
    const area = pick(AREAS)
    const daysIn = Math.floor(rand() * 30) + 1
    const phone = '9' + Math.floor(100000000 + rand() * 899999999)
    const code = pick(GROUP_CODES.filter((c) => c.includes(area.slice(0, 3).toUpperCase()))) ?? pick(GROUP_CODES)
    const r = rand()
    const status: Subscriber['status'] = r < 0.78 ? 'active' : r < 0.92 ? 'paused' : 'churned'
    const totalMeals = 90
    const expectedServed = Math.floor((daysIn / 30) * totalMeals)
    const variance = Math.floor((rand() - 0.5) * 6)
    const mealsServed = Math.max(0, Math.min(totalMeals, expectedServed + variance))
    const allergens: string[] = []
    if (rand() < 0.18) allergens.push('Dairy')
    if (rand() < 0.12) allergens.push('Peanuts')
    if (rand() < 0.08) allergens.push('Gluten')

    subs.push({
      id: `s_${i}_${phone}`,
      name: `${first} ${last}`,
      phone,
      area,
      pgName: `${pick(PG_PREFIX)} ${rand() < 0.5 ? 'PG' : 'Hostel'}`,
      planId,
      groupCode: planId === 'solo' ? `KF-SOLO-${phone.slice(-4)}` : code,
      joinedAt: Date.now() - daysIn * 24 * 60 * 60 * 1000,
      daysIn,
      mealsServed,
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      status,
      allergens,
    })
  }
  return subs
}

export function seedKitchens(): Kitchen[] {
  return KITCHENS
}

export function kitchenForArea(area: string): string {
  return AREA_TO_KITCHEN[area] ?? 'k_omr'
}

export function seedGroups(subscribers: Subscriber[]): AdminGroup[] {
  const map = new Map<string, AdminGroup>()
  for (const s of subscribers) {
    const plan = PLANS.find((p) => p.id === s.planId)!
    if (plan.id === 'solo') continue
    const existing = map.get(s.groupCode)
    if (existing) {
      existing.members += 1
      existing.monthlySavings += plan.savingPerMonth
    } else {
      map.set(s.groupCode, {
        code: s.groupCode,
        members: 1,
        planId: plan.id,
        monthlySavings: plan.savingPerMonth,
        area: s.area,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.members - a.members)
}
