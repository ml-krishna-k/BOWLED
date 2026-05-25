import mongoose from 'mongoose'
import { config } from './config.js'
import { connectDb } from './db.js'
import { User } from './models/User.js'
import { Subscription } from './models/Subscription.js'
import { Kitchen } from './models/Kitchen.js'

const FIRST = [
  'Aarav', 'Sneha', 'Karthik', 'Priya', 'Vikram', 'Anjali', 'Rohan', 'Divya',
  'Arjun', 'Meera', 'Aditya', 'Lakshmi', 'Sai', 'Pooja', 'Rahul', 'Ishita',
  'Nikhil', 'Ananya', 'Harish', 'Bhavana', 'Surya', 'Kavya', 'Manoj', 'Tara',
]
const LAST = [
  'Mehta', 'Iyer', 'Reddy', 'Suresh', 'Subramaniam', 'Pillai',
  'Sharma', 'Venkatesh', 'Murthy', 'Rao', 'Nair', 'Bhat',
  'Kumar', 'Raj', 'Srinivasan',
]
const AREAS = [
  'Adyar', 'Velachery', 'OMR (Thoraipakkam)', 'T. Nagar', 'Anna Nagar',
  'Tambaram', 'Kotturpuram', 'Besant Nagar', 'Saidapet', 'Guindy',
]
const PG_PREFIX = ['Padmavathy', 'Saraswathi', 'Lakshmi', 'Cauvery', 'Anand', 'Vinayaga', 'Sri Sai', 'Mahalakshmi']

const KITCHEN_DATA = [
  {
    code: 'k_adyar', name: 'Saraswathi Akka', area: 'Adyar', chef: 'Saraswathi Akka',
    chefPhone: '9840012001', capacityPerDay: 240, todaysLoad: 198,
    rating: 4.8, specialty: 'Tamil home cooking', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_vela', name: 'Padma Aunty', area: 'Velachery', chef: 'Padma Aunty',
    chefPhone: '9840012002', capacityPerDay: 220, todaysLoad: 180,
    rating: 4.7, specialty: 'South Indian classics', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_omr', name: 'Chef Anil', area: 'OMR (Thoraipakkam)', chef: 'Chef Anil',
    chefPhone: '9840012003', capacityPerDay: 300, todaysLoad: 252,
    rating: 4.6, specialty: 'North-South fusion', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_tnagar', name: 'Meera Akka', area: 'T. Nagar', chef: 'Meera Akka',
    chefPhone: '9840012004', capacityPerDay: 200, todaysLoad: 168,
    rating: 4.9, specialty: 'Chettinad & coastal', fssaiGrade: 'A' as const,
  },
]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function seed() {
  await connectDb()
  const rand = mulberry32(20251101)
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]

  console.log('… clearing existing seed data')
  // Seeded users get phone numbers starting with '7'. Real signup users
  // use 6/8/9 prefixes, so this wipe leaves them and the admin user alone.
  const seedUsers = await User.find({ phone: { $regex: /^7/ } }, { _id: 1 })
  const seedIds = seedUsers.map((u) => u._id)
  await Promise.all([
    Kitchen.deleteMany({}),
    User.deleteMany({ _id: { $in: seedIds } }),
    Subscription.deleteMany({ userId: { $in: seedIds } }),
  ])

  console.log('… seeding kitchens')
  await Kitchen.insertMany(KITCHEN_DATA)

  console.log('… ensuring admin user')
  for (const phone of config.adminPhones) {
    await User.findOneAndUpdate(
      { phone },
      {
        // Promote/keep admin status on every run (idempotent).
        $set: { isAdmin: true },
        // Other fields only on first insert; don't overwrite a real user's name etc.
        $setOnInsert: {
          name: 'Bowled Admin',
          address: { line1: 'Admin office', area: 'Chennai', city: 'Chennai' },
          pgName: '',
          allergens: [],
          parentReport: false,
          notifications: true,
          rating: 5.0,
        },
      },
      { upsert: true, new: true },
    )
  }

  console.log('… seeding 24 demo subscribers')
  const pickPlan = () => {
    const r = rand()
    if (r < 0.25) return 'solo' as const
    if (r < 0.8) return 'squad' as const
    return 'floor' as const
  }
  const groupCodes = [
    'BW-ADY-7K2', 'BW-VEL-MQ4', 'BW-OMR-X9P', 'BW-TNG-A4R',
    'BW-ADY-B8L', 'BW-VEL-C2W', 'BW-OMR-D6Z', 'BW-TNG-E1M',
  ]
  // Seed users get a phone in the 7xxxxxxxxx range so they don't collide with
  // the 9xxxxxxxxx range typically used for real signups in this demo.
  for (let i = 0; i < 24; i++) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const planId = pickPlan()
    const area = pick(AREAS)
    const phone = '7' + String(Math.floor(100000000 + rand() * 899999999)).slice(0, 9)
    const daysIn = Math.floor(rand() * 30) + 1
    const startedAt = Date.now() - daysIn * 24 * 60 * 60 * 1000
    const totalMeals = 90
    const variance = Math.floor((rand() - 0.5) * 6)
    const mealsServed = Math.max(0, Math.min(totalMeals, Math.floor((daysIn / 30) * totalMeals) + variance))
    const rStatus = rand()
    const status: 'active' | 'paused' | 'churned' = rStatus < 0.78 ? 'active' : rStatus < 0.92 ? 'paused' : 'churned'
    const allergens: string[] = []
    if (rand() < 0.18) allergens.push('Dairy')
    if (rand() < 0.12) allergens.push('Peanuts')
    if (rand() < 0.08) allergens.push('Gluten')

    const user = await User.create({
      phone,
      name: `${first} ${last}`,
      isAdmin: false,
      address: { line1: '—', area, city: 'Chennai' },
      pgName: `${pick(PG_PREFIX)} ${rand() < 0.5 ? 'PG' : 'Hostel'}`,
      allergens,
      parentReport: false,
      notifications: true,
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
    })

    await Subscription.create({
      userId: user._id,
      planId,
      billingCycleId: 'monthly-no-sun',
      groupCode: planId === 'solo' ? `BW-SOLO-${phone.slice(-4)}` : pick(groupCodes),
      groupSize: planId === 'solo' ? 1 : planId === 'squad' ? 5 : 10,
      startedAt,
      cycleStartedAt: startedAt,
      totalMeals,
      mealsServed,
      status,
    })
  }

  console.log('✓ Seed complete')
  await mongoose.disconnect()
}

seed().catch(async (err) => {
  console.error('✗ Seed failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})
