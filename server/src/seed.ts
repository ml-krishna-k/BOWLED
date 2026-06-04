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
 * Idempotent — re-running does not duplicate kitchens.
 *
 * What it does:
 *  - Resets the four FSSAI Grade A kitchens (Adyar / Velachery / OMR / T. Nagar)
 *  - Cleans up any legacy demo subscribers (phone starting with 7) from older
 *    seed runs that created fake users
 *
 * Does NOT pre-create admin users any more. Under Google OAuth, admins are
 * promoted automatically on first sign-in if their email is in ADMIN_EMAILS.
 * Just have the admin sign in with Google once and they'll be flagged.
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

  if (config.adminEmails.length > 0) {
    console.log(`✓ Admin emails configured: ${config.adminEmails.join(', ')}`)
    console.log('  → Sign in with Google using these accounts to be auto-promoted.')
  } else {
    console.warn('! ADMIN_EMAILS is empty — no admin promotion will happen on login.')
  }

  console.log('✓ Seed complete')
  await mongoose.disconnect()
}

seed().catch(async (err) => {
  console.error('✗ Seed failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})
