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

function parseTestPhones(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const pair of raw.split(',')) {
    const [phone, otp] = pair.split(':').map((s) => s.trim())
    if (/^[6-9]\d{9}$/.test(phone) && /^\d{4,8}$/.test(otp)) {
      out[phone] = otp
    }
  }
  return out
}

/**
 * Phones with a permanent "the OTP is the last 6 digits of the phone" rule.
 * Kept in code (not env) so the test logins always work, even on a fresh
 * deploy with no manual env setup.
 *   9360113501 → OTP 113501   (admin)
 *   6380825525 → OTP 825525   (demo user)
 */
export const BUILTIN_TEST_PHONES: Record<string, string> = {
  '9360113501': '113501',
  '6380825525': '825525',
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
  // Test-phone allowlist — phone → otp. These bypass MSG91 entirely so QA /
  // demos work without real SMS, in BOTH dev and prod. By convention the OTP
  // is the LAST 6 DIGITS of the phone.
  // The built-in pair is merged with anything from the TEST_PHONES env var
  // ("phone:otp,phone:otp"), so you can add more without a code change.
  // ⚠ SECURITY: anyone who knows a pair can log in as that phone. Remove
  //   the built-ins (or rotate the phones) before a real public launch.
  testPhones: {
    ...BUILTIN_TEST_PHONES,
    ...parseTestPhones(process.env.TEST_PHONES ?? ''),
  },
  nodeEnv: process.env.NODE_ENV ?? 'development',
  msg91: {
    apiKey: (process.env.MSG91_API_KEY ?? '').trim(),
    templateId: (process.env.MSG91_TEMPLATE_ID ?? '').trim(),
    senderId: (process.env.MSG91_SENDER_ID ?? '').trim(),
    countryCode: (process.env.MSG91_COUNTRY_CODE ?? '91').trim(),
    // Widget-flow mode — set MSG91_WIDGET_ID to switch to the OTP-widget
    // path (browser handles SMS, server only validates the returned token).
    widgetId: (process.env.MSG91_WIDGET_ID ?? '').trim(),
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

/** True when the MSG91 OTP-Widget path is configured (apiKey + widgetId). */
export function isMsg91WidgetEnabled(): boolean {
  return !!(config.msg91.apiKey && config.msg91.widgetId)
}

/** True when the legacy server-side MSG91 OTP API is configured (apiKey + templateId). */
export function isMsg91LegacyEnabled(): boolean {
  return !!(config.msg91.apiKey && config.msg91.templateId)
}

/** True when EITHER MSG91 mode is available. The mock OTP fallback kicks in below this. */
export function isMsg91Enabled(): boolean {
  return isMsg91WidgetEnabled() || isMsg91LegacyEnabled()
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
  console.error('✗ Refusing to start in production without MSG91 credentials.')
  console.error('   Set MSG91_API_KEY + MSG91_WIDGET_ID (widget mode)')
  console.error('   OR MSG91_API_KEY + MSG91_TEMPLATE_ID (legacy server-side OTP)')
  process.exit(1)
}

// Startup visibility — which auth mode is active?
if (isMsg91WidgetEnabled()) {
  console.log(`✓ MSG91 widget mode (widgetId: ${config.msg91.widgetId.slice(0, 8)}…)`)
} else if (isMsg91LegacyEnabled()) {
  console.log(`✓ MSG91 legacy API mode (template: ${config.msg91.templateId})`)
} else {
  console.warn('! MSG91 not configured — using mock OTP fallback (dev only)')
}

const testPhoneList = Object.keys(config.testPhones)
if (testPhoneList.length > 0) {
  console.log(`! Test phones active (bypass MSG91): ${testPhoneList.join(', ')}`)
}
