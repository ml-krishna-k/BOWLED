import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'

// Load the root .env (server runs from server/, but .env lives at repo root).
// `override: true` ensures the file wins over any stale variables already in
// the shell environment.
const rootEnv = path.resolve(process.cwd(), '..', '.env')
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: true })
} else {
  dotenv.config({ override: true })
}

function required(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`✗ Missing required env var: ${name}`)
    process.exit(1)
  }
  return v
}

export const config = {
  port: Number(process.env.PORT ?? 4000),

  /* ---------- Mongo ---------- */
  mongoUri: required('mongo_db_uri'),
  // Optional — if set, used instead of credentials embedded in mongo_db_uri.
  // Lets you paste an Atlas-generated password with any special characters
  // without worrying about URI encoding.
  mongoUser: (process.env.MONGO_USER ?? '').trim(),
  mongoPass: (process.env.MONGO_PASS ?? '').trim(),
  mongoDb: (process.env.MONGO_DB ?? 'bowled').trim(),

  /* ---------- Session JWT ---------- */
  jwtSecret: process.env.JWT_SECRET ?? 'bowled-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',

  /* ---------- CORS ---------- */
  // Comma-separated list. Trailing slashes + casing are normalised so
  // "https://X/" and "https://x" both match.
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, '').toLowerCase())
    .filter(Boolean),

  /* ---------- Google OAuth ---------- */
  // Get from https://console.cloud.google.com/apis/credentials → OAuth 2.0
  // Client ID → "Web application". The same value is exposed to the browser
  // via VITE_GOOGLE_CLIENT_ID. The clientSecret is NOT used for the ID-token
  // verification flow — Google's public keys (JWKS) are enough.
  google: {
    clientId: (process.env.GOOGLE_CLIENT_ID ?? '').trim(),
  },

  /* ---------- Admin promotion ---------- */
  // Comma-separated emails. Any user who signs in with a Google account whose
  // email matches an entry here is auto-promoted to admin on first login.
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  /* ---------- Misc ---------- */
  nodeEnv: process.env.NODE_ENV ?? 'development',

  /* ---------- Cloudinary (image uploads) ---------- */
  cloudinary: {
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME ?? process.env.cloudinary_cloud_name ?? '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY ?? process.env.cloudinary_api_key ?? '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET ?? process.env.cloudinary_api_secret ?? '').trim(),
    folder: (process.env.CLOUDINARY_FOLDER ?? process.env.cloudinary_folder ?? 'bowled').trim(),
  },

  /* ---------- UPI manual payments ---------- */
  upi: {
    id:   (process.env.BUSINESS_UPI_ID ?? '').trim(),
    name: (process.env.BUSINESS_NAME ?? 'Bowled').trim(),
  },
}

export function isGoogleAuthEnabled(): boolean {
  return !!config.google.clientId
}

export function isCloudinaryEnabled(): boolean {
  return !!(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)
}

/* ---------- Startup validation + visibility ---------------------------- */

if (config.jwtSecret === 'bowled-dev-secret-change-me' && config.nodeEnv === 'production') {
  console.error('✗ Refusing to start in production with the default JWT_SECRET')
  process.exit(1)
}

if (!isGoogleAuthEnabled()) {
  if (config.nodeEnv === 'production') {
    console.error('✗ Refusing to start in production without GOOGLE_CLIENT_ID.')
    console.error('   Get one from https://console.cloud.google.com/apis/credentials')
    process.exit(1)
  }
  console.warn('! GOOGLE_CLIENT_ID is not set — /api/auth/google will 503 until you set it.')
} else {
  console.log(`✓ Google OAuth configured (clientId: ${config.google.clientId.slice(0, 16)}…)`)
}

if (config.adminEmails.length > 0) {
  console.log(`✓ Admin emails: ${config.adminEmails.join(', ')}`)
} else {
  console.warn('! ADMIN_EMAILS is empty — no one will be promoted to admin on login.')
}

if (isCloudinaryEnabled()) {
  console.log(`✓ Cloudinary configured (cloud: ${config.cloudinary.cloudName}, folder: ${config.cloudinary.folder})`)
} else {
  const missing = [
    !config.cloudinary.cloudName && 'CLOUDINARY_CLOUD_NAME',
    !config.cloudinary.apiKey && 'CLOUDINARY_API_KEY',
    !config.cloudinary.apiSecret && 'CLOUDINARY_API_SECRET',
  ].filter(Boolean).join(', ')
  console.warn(`! Cloudinary disabled — missing: ${missing}. Image uploads will 503.`)
}
