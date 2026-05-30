import mongoose from 'mongoose'
import { config } from './config.js'

mongoose.set('strictQuery', true)

/**
 * Atlas's auto-generated passwords routinely contain URI-reserved characters
 * (`@`, `:`, `/`, `#`, `?`, `%` …). When pasted raw into a `mongodb+srv://`
 * URI they break parsing (e.g. an `@` in the password makes the driver think
 * the host starts mid-password and fails DNS lookup on garbage).
 *
 * This wrapper finds the password between `://USER:` and the *last* `@` —
 * the last `@` is always the host separator regardless of how many `@`s the
 * password contains — and URL-encodes it. If the password was already
 * encoded, decoding first prevents double-encoding.
 */
function normalizeMongoUri(uri: string): string {
  const schemeMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)/)
  if (!schemeMatch) return uri

  const scheme = schemeMatch[0]
  const rest = uri.slice(scheme.length)

  const atIndex = rest.lastIndexOf('@')
  if (atIndex === -1) return uri // no credentials at all

  const credPart = rest.slice(0, atIndex)
  const hostPart = rest.slice(atIndex + 1)
  const colonIndex = credPart.indexOf(':')
  if (colonIndex === -1) return uri // user but no password

  const user = credPart.slice(0, colonIndex)
  const passRaw = credPart.slice(colonIndex + 1)

  let pass: string
  try { pass = decodeURIComponent(passRaw) } catch { pass = passRaw }

  return `${scheme}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hostPart}`
}

/** Strip `user:pass@` from a URI — used when credentials come via options instead. */
function stripCredsFromUri(uri: string): string {
  const schemeMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)/)
  if (!schemeMatch) return uri
  const scheme = schemeMatch[0]
  const rest = uri.slice(scheme.length)
  const atIndex = rest.lastIndexOf('@')
  return atIndex === -1 ? uri : scheme + rest.slice(atIndex + 1)
}

export async function connectDb(): Promise<void> {
  let uri: string
  const options: Parameters<typeof mongoose.connect>[1] = {
    autoIndex: config.nodeEnv !== 'production',
    serverSelectionTimeoutMS: 15_000,
    // Force the target DB name regardless of what the URI does or doesn't
    // contain. Avoids the silent "defaults to test DB" trap on Atlas, where
    // a user scoped to readWrite@bowled then 500s with "user is not allowed
    // to do action find on test.users".
    dbName: config.mongoDb,
  }

  if (config.mongoUser && config.mongoPass) {
    // Preferred path: credentials via options. Mongoose URL-encodes internally,
    // so the user can paste any Atlas-generated password verbatim.
    uri = stripCredsFromUri(config.mongoUri)
    options.user = config.mongoUser
    options.pass = config.mongoPass
    console.log(`[db] auth via MONGO_USER='${config.mongoUser}' (pass length: ${config.mongoPass.length})`)
  } else {
    // Fallback: credentials embedded in URI. We URL-encode any reserved chars.
    uri = normalizeMongoUri(config.mongoUri)
    const userFromUri = uri.match(/:\/\/([^:]+):/)?.[1] ?? '(none)'
    console.log(`[db] auth via mongo_db_uri (user='${userFromUri}')`)
  }

  console.log(`[db] target database: ${config.mongoDb}`)
  await mongoose.connect(uri, options)
  console.log(`✓ Mongo connected · ${mongoose.connection.name}`)

  // Ask Mongo who we authenticated as. The startup-log line above tries to
  // parse the user from the URI but fails when the password contains URL-
  // encoded characters; this is the authoritative answer. Useful for
  // diagnosing "user is not allowed to do action" errors — those mean the
  // user named here doesn't have the right role in Atlas.
  try {
    const db = mongoose.connection.db
    if (db) {
      const status = (await db.admin().command({ connectionStatus: 1 })) as {
        authInfo?: { authenticatedUsers?: Array<{ user: string; db: string }> }
      }
      const u = status.authInfo?.authenticatedUsers?.[0]
      if (u) {
        console.log(`[db] authenticated as: ${u.user}@${u.db}`)
      } else {
        console.warn('[db] WARNING: connected without authenticating — Atlas will deny most reads')
      }
    }
  } catch (err) {
    console.warn(`[db] could not query auth status: ${err instanceof Error ? err.message : String(err)}`)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('… Mongo disconnected')
})
mongoose.connection.on('error', (err) => {
  console.error('✗ Mongo error:', err.message)
})
