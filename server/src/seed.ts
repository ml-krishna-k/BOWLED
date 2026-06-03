import mongoose from 'mongoose'
import { config } from './config.js'
import { connectDb } from './db.js'
import { User } from './models/User.js'
import { Subscription } from './models/Subscription.js'
import { Kitchen } from './models/Kitchen.js'

/**
 * One-shot seed.
 *
 *   npm run seed
 *
 * Idempotent — re-running it does not duplicate kitchens or admins.
 *
 * What it does:
 *  - Resets the four FSSAI Grade A kitchens (Adyar / Velachery / OMR / T. Nagar)
 *  - Ensures the admin user(s) listed in ADMIN_PHONES exist + are promoted
 *  - Cleans up any historical demo subscribers seeded with the 7xxxxxxxxx
 *    phone pattern (older builds inserted 24 fake subscribers — that's gone)
 *
 * Does NOT create fake subscribers. Real signups land in /api/auth/* like
 * any normal user. If you want a totally clean slate, run `reset:users`.
 */

const KITCHEN_DATA = [
  {
    code: 'k_adyar', name: 'Saraswathi Akka', area: 'Adyar', chef: 'Saraswathi Akka',
    chefPhone: '9840012001', capacityPerDay: 240, todaysLoad: 0,
    rating: 4.8, specialty: 'Tamil home cooking', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_vela', name: 'Padma Aunty', area: 'Velachery', chef: 'Padma Aunty',
    chefPhone: '9840012002', capacityPerDay: 220, todaysLoad: 0,
    rating: 4.7, specialty: 'South Indian classics', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_omr', name: 'Chef Anil', area: 'OMR (Thoraipakkam)', chef: 'Chef Anil',
    chefPhone: '9840012003', capacityPerDay: 300, todaysLoad: 0,
    rating: 4.6, specialty: 'North-South fusion', fssaiGrade: 'A' as const,
  },
  {
    code: 'k_tnagar', name: 'Meera Akka', area: 'T. Nagar', chef: 'Meera Akka',
    chefPhone: '9840012004', capacityPerDay: 200, todaysLoad: 0,
    rating: 4.9, specialty: 'Chettinad & coastal', fssaiGrade: 'A' as const,
  },
]

async function seed() {
  await connectDb()

  console.log('… clearing legacy demo subscribers (7xxxxxxxxx pattern)')
  // Older versions of this seed created 24 fake subscribers with phones
  // starting with '7'. We never insert those any more — but if you're
  // running this on an existing dev DB, wipe the historical fakes too so
  // the admin views aren't cluttered.
  const fakeUsers = await User.find(
    { phone: { $regex: /^7/ }, isAdmin: { $ne: true } },
    { _id: 1 },
  )
  const fakeIds = fakeUsers.map((u) => u._id)
  if (fakeIds.length > 0) {
    await Promise.all([
      User.deleteMany({ _id: { $in: fakeIds } }),
      Subscription.deleteMany({ userId: { $in: fakeIds } }),
    ])
    console.log(`  ✓ removed ${fakeIds.length} demo user(s) and their subscriptions`)
  } else {
    console.log('  (no legacy demo users found)')
  }

  console.log('… seeding kitchens')
  await Kitchen.deleteMany({})
  await Kitchen.insertMany(KITCHEN_DATA)

  console.log('… ensuring admin user(s)')
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
    console.log(`  ✓ admin: ${phone}`)
  }

  console.log('✓ Seed complete')
  await mongoose.disconnect()
}

seed().catch(async (err) => {
  console.error('✗ Seed failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})
