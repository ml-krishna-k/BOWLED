/**
 * One-off fix for the legacy users.phone_1 unique index.
 *
 *   npm run fix:phone-index
 *
 * What it does, in order:
 *   1. $unset any `phone` field that's an empty string. These would otherwise
 *      collide on the new partial unique index since they all have phone=''.
 *   2. Drop the legacy `phone_1` index (created when phone was required+unique).
 *   3. On the next server boot, Mongoose's autoIndex syncs the schema — it
 *      creates the new partial unique index (only indexes phone when set +
 *      non-empty), so multiple users without phones don't collide and two
 *      real phones still can't duplicate.
 *
 * Idempotent — safe to re-run.
 */
import mongoose from 'mongoose'
import { config } from './config.js'
import { connectDb } from './db.js'

async function main() {
  await connectDb()
  const db = mongoose.connection.db
  if (!db) throw new Error('Mongo handle missing')

  console.log(`\n──────── Fix users.phone index ────────`)
  console.log(`db: ${config.mongoDb}\n`)

  /* 1 — Clean up empty-string phones so the partial index can be created
   *     without collisions. */
  const before = await db.collection('users').countDocuments({ phone: '' })
  if (before > 0) {
    const res = await db.collection('users').updateMany(
      { phone: '' },
      { $unset: { phone: '' } },
    )
    console.log(`  ✓ unset phone="" on ${res.modifiedCount} user(s)`)
  } else {
    console.log(`  (no users with empty-string phone)`)
  }

  /* 2 — Drop the legacy unique index. */
  const indexes = await db.collection('users').indexes()
  const legacy = indexes.find((i) => i.name === 'phone_1')
  if (legacy) {
    await db.collection('users').dropIndex('phone_1')
    console.log(`  ✓ dropped legacy index "phone_1"`)
  } else {
    console.log(`  (no "phone_1" index found — already migrated)`)
  }

  /* 3 — Mongoose will recreate the partial unique index on next server
   *     boot via autoIndex. We could also do it here for completeness,
   *     but it's risk-free either way — the user runs this once and the
   *     next `npm --prefix server run dev` syncs the schema. */
  console.log(`\n✓ Done. Restart the API server to let Mongoose sync the new partial unique index.\n`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('✗ fix-phone-index failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
