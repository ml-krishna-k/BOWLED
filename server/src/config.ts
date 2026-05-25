import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'

// Load the root .env (server runs from server/, but .env lives at repo root).
// `override: true` ensures the file wins over any stale variables already in
// the shell environment (e.g. a previously-exported MSG91_API_KEY).
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
  mongoUri: required('mongo_db_uri'),
  // Optional — if set, used instead of credentials embedded in mongo_db_uri.
  // Lets you paste an Atlas-generated password with any special characters
  // without worrying about URI encoding.
  mongoUser: process.env.MONGO_USER ?? '',
  mongoPass: process.env.MONGO_PASS ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'bowled-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  // Accept a comma-separated list so one .env can cover dev + prod
  // (e.g. "http://localhost:5173,https://bowled.app"). Trailing slashes
  // are normalised so "https://x/" and "https://x" both match.
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  adminPhones: (process.env.ADMIN_PHONES ?? '9360113501').split(',').map((s) => s.trim()).filter(Boolean),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  msg91: {
    apiKey: process.env.MSG91_API_KEY ?? '',
    templateId: process.env.MSG91_TEMPLATE_ID ?? '',
    senderId: process.env.MSG91_SENDER_ID ?? '',
    countryCode: process.env.MSG91_COUNTRY_CODE ?? '91',
  },
  cloudinary: {
    // Accept either UPPERCASE or lowercase variants, and trim whitespace —
    // pasted Cloudinary values often pick up a trailing newline or space.
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME ?? process.env.cloudinary_cloud_name ?? '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY ?? process.env.cloudinary_api_key ?? '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET ?? process.env.cloudinary_api_secret ?? '').trim(),
    folder: (process.env.CLOUDINARY_FOLDER ?? process.env.cloudinary_folder ?? 'bowled').trim(),
  },
}

/** True when MSG91 is fully configured — otherwise the server falls back to a mock OTP for dev. */
export function isMsg91Enabled(): boolean {
  return !!(config.msg91.apiKey && config.msg91.templateId)
}

/** True when Cloudinary is fully configured. Upload route 503s otherwise. */
export function isCloudinaryEnabled(): boolean {
  return !!(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)
}

if (config.jwtSecret === 'bowled-dev-secret-change-me' && config.nodeEnv === 'production') {
  console.error('✗ Refusing to start in production with the default JWT_SECRET')
  process.exit(1)
}

// Startup visibility — confirms whether Cloudinary picked up its env on boot.
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

if (config.nodeEnv === 'production' && !isMsg91Enabled()) {
  console.error('✗ Refusing to start in production without MSG91 credentials (MSG91_API_KEY + MSG91_TEMPLATE_ID)')
  process.exit(1)
}
