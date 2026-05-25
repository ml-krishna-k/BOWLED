/**
 * Standalone Mongo connection probe.
 *
 *   npm run check:db
 *
 * Loads .env, attempts to connect using the same auth logic as the running
 * server, then prints a clear verdict. Safe to re-run — read-only.
 */
import mongoose from 'mongoose'
import { config } from './config.js'

function stripCredsFromUri(uri: string): string {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/)/)
  if (!m) return uri
  const rest = uri.slice(m[0].length)
  const at = rest.lastIndexOf('@')
  return at === -1 ? uri : m[0] + rest.slice(at + 1)
}

function normalizeUriPass(uri: string): string {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/)/)
  if (!m) return uri
  const rest = uri.slice(m[0].length)
  const at = rest.lastIndexOf('@')
  if (at === -1) return uri
  const cred = rest.slice(0, at)
  const host = rest.slice(at + 1)
  const colon = cred.indexOf(':')
  if (colon === -1) return uri
  const user = cred.slice(0, colon)
  let pass = cred.slice(colon + 1)
  try { pass = decodeURIComponent(pass) } catch {}
  return `${m[0]}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}`
}

async function main() {
  console.log('\n──────── Mongo connection probe ────────')

  let uri: string
  const options: Parameters<typeof mongoose.connect>[1] = {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: false,
  }

  if (config.mongoUser && config.mongoPass) {
    uri = stripCredsFromUri(config.mongoUri)
    options.user = config.mongoUser
    options.pass = config.mongoPass
    console.log(`auth path  : MONGO_USER + MONGO_PASS`)
    console.log(`user       : ${config.mongoUser}`)
    console.log(`pass length: ${config.mongoPass.length} chars`)
    console.log(`first/last : '${config.mongoPass[0]}…${config.mongoPass[config.mongoPass.length - 1]}'`)
  } else {
    uri = normalizeUriPass(config.mongoUri)
    const userFromUri = uri.match(/:\/\/([^:]+):/)?.[1] ?? '(none)'
    console.log(`auth path  : embedded in mongo_db_uri`)
    console.log(`user       : ${userFromUri}`)
  }
  console.log(`host       : ${uri.replace(/^[^@]*@?/, '').slice(0, 80)}…`)
  console.log('────────────────────────────────────────')

  try {
    await mongoose.connect(uri, options)
    const dbName = mongoose.connection.name
    const collections = await mongoose.connection.db?.listCollections().toArray() ?? []
    console.log(`\n✓ CONNECTED · db = "${dbName}"`)
    if (collections.length) {
      console.log(`  collections (${collections.length}):`)
      for (const c of collections.slice(0, 12)) {
        const count = await mongoose.connection.db!.collection(c.name).estimatedDocumentCount()
        console.log(`    • ${c.name.padEnd(28)} ${count} docs`)
      }
    } else {
      console.log(`  (no collections yet — run "npm run seed" to populate)`)
    }
    console.log('\n→ All systems go. The server will boot fine with these credentials.\n')
  } catch (err) {
    const e = err as { message?: string; codeName?: string; code?: number }
    console.log(`\n✗ FAILED`)
    console.log(`  reason  : ${e.message ?? String(err)}`)
    if (e.codeName) console.log(`  code    : ${e.codeName} (${e.code})`)

    if (e.message?.includes('bad auth')) {
      console.log(`\n  Likely : password value doesn't match what Atlas has for this user.`)
      console.log(`           Re-rotate in Atlas → Database Access → Edit Password,`)
      console.log(`           preferably with a custom password using only A-Z a-z 0-9 - _ . !`)
    } else if (e.message?.includes('ENOTFOUND') || e.message?.includes('querySrv')) {
      console.log(`\n  Likely : URI is malformed (special char in password broke parsing).`)
      console.log(`           Switch to MONGO_USER + MONGO_PASS env vars and strip creds from the URI.`)
    } else if (e.message?.includes('whitelist') || e.message?.includes('IP')) {
      console.log(`\n  Likely : your current IP isn't on the Atlas allow-list.`)
      console.log(`           Atlas → Network Access → Add IP Address → Add Current IP Address.`)
    }
    console.log('')
    process.exitCode = 1
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

main().catch((err) => {
  console.error('unexpected:', err)
  process.exit(1)
})
