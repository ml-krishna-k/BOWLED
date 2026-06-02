/**
 * Wipe every admin-set MenuOverride row so the WEEKLY_MENU baseline in
 * src/data/menu.ts becomes the source of truth across the app.
 *
 *   npm run reset:menu
 *
 * Run this once after changing the static menu so any prior tweaks made via
 * the admin /admin/menu editor don't leak through and confuse the new menu.
 * Safe to re-run — only touches the menu_overrides collection.
 */
import mongoose from 'mongoose'
import { config } from './config.js'
import { MenuOverride } from './models/MenuOverride.js'

function stripCredsFromUri(uri: string): string {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/)/)
  if (!m) return uri
  const rest = uri.slice(m[0].length)
  const at = rest.lastIndexOf('@')
  return at === -1 ? uri : m[0] + rest.slice(at + 1)
}

async function main() {
  console.log('\n──────── Reset menu overrides ────────')

  let uri: string
  const options: Parameters<typeof mongoose.connect>[1] = {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: false,
    dbName: config.mongoDb,
  }

  if (config.mongoUser && config.mongoPass) {
    uri = stripCredsFromUri(config.mongoUri)
    options.user = config.mongoUser
    options.pass = config.mongoPass
  } else {
    uri = config.mongoUri
  }

  await mongoose.connect(uri, options)
  console.log(`✓ connected · db = "${mongoose.connection.name}"`)

  const before = await MenuOverride.estimatedDocumentCount()
  console.log(`  current overrides: ${before}`)

  if (before === 0) {
    console.log('  nothing to delete — baseline is already the source of truth.\n')
  } else {
    const { deletedCount } = await MenuOverride.deleteMany({})
    console.log(`  ✓ deleted ${deletedCount} override row(s).`)
    console.log('  New WEEKLY_MENU baseline is now live across the app.\n')
  }

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('✗ reset failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
