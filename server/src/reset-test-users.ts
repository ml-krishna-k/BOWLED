/**
 * Wipe every non-admin user + their dependent data.
 *
 *   npm run reset:users
 *
 * Use this when you want a clean slate — no demo subscribers, no leftover
 * test signups, no orphan payments. Admins (anyone with isAdmin=true) are
 * preserved. Kitchens, menu overrides, and any other reference data are
 * also preserved.
 *
 * Collections wiped (filtered to non-admin user ids):
 *   - users
 *   - subscriptions
 *   - payments
 *   - paymentaudits
 *   - skipnotifications
 *
 * Idempotent. Safe to re-run. PRODUCTION SAFETY: this is destructive —
 * confirm twice before running on a real DB.
 */
import mongoose from 'mongoose'
import { config } from './config.js'
import { connectDb } from './db.js'
import { User } from './models/User.js'
import { Subscription } from './models/Subscription.js'
import { Payment } from './models/Payment.js'
import { PaymentAudit } from './models/PaymentAudit.js'
import { SkipNotification } from './models/SkipNotification.js'

async function reset() {
  await connectDb()

  console.log('\n──────── Reset test users ────────')
  console.log(`target db: ${config.mongoDb}`)
  console.log('────────────────────────────────────\n')

  const nonAdmins = await User.find({ isAdmin: { $ne: true } }, { _id: 1, phone: 1, name: 1 })
  const userIds = nonAdmins.map((u) => u._id)

  console.log(`Found ${nonAdmins.length} non-admin user(s) to wipe.`)
  if (nonAdmins.length > 0) {
    const sample = nonAdmins.slice(0, 5).map((u) => `${u.phone} (${u.name})`).join(', ')
    console.log(`  e.g. ${sample}${nonAdmins.length > 5 ? '…' : ''}`)
  }

  if (userIds.length === 0) {
    console.log('\n  Nothing to delete. Admins are preserved either way.\n')
    await mongoose.disconnect()
    return
  }

  const [subsRes, paysRes, auditRes, skipRes, usersRes] = await Promise.all([
    Subscription.deleteMany({ userId: { $in: userIds } }),
    Payment.deleteMany({ userId: { $in: userIds } }),
    PaymentAudit.deleteMany({ adminId: { $in: userIds } }),
    SkipNotification.deleteMany({ userId: { $in: userIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ])

  console.log('\n✓ Wipe complete:')
  console.log(`    users           : ${usersRes.deletedCount}`)
  console.log(`    subscriptions   : ${subsRes.deletedCount}`)
  console.log(`    payments        : ${paysRes.deletedCount}`)
  console.log(`    payment audits  : ${auditRes.deletedCount}`)
  console.log(`    skip notifs     : ${skipRes.deletedCount}`)

  const remaining = await User.countDocuments({ isAdmin: true })
  console.log(`\n  Admins preserved: ${remaining}\n`)

  await mongoose.disconnect()
}

reset().catch(async (err) => {
  console.error('✗ reset failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
