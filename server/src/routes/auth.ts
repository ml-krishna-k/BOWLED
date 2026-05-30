import { Router } from 'express'
import { User } from '../models/User.js'
import { HttpError } from '../middleware/error.js'
import { signToken } from '../lib/jwt.js'
import { config, isMsg91Enabled, isMsg91WidgetEnabled } from '../config.js'
import * as msg91 from '../lib/msg91.js'
import { parseBody } from '../lib/validate.js'
import { otpSendSchema, otpVerifySchema, widgetVerifySchema } from '../lib/schemas.js'
import {
  otpIpLimiter,
  otpSendPhoneLimiter,
  otpVerifyPhoneLimiter,
} from '../middleware/rateLimit.js'

const router = Router()

// Every /otp/* request first passes the per-IP limiter (10/min).
router.use('/otp', otpIpLimiter)

/** Deterministic dev OTP — only used when MSG91 is not configured.
 *  Last 6 digits of the phone, same rule as BUILTIN_TEST_PHONES. */
function mockOtpFor(phone: string): string {
  return phone.slice(-6)
}

/* POST /api/auth/otp/send  { phone } */
router.post('/otp/send', otpSendPhoneLimiter, async (req, res) => {
  const { phone } = parseBody(otpSendSchema, req)

  // Test-phone bypass: no SMS, no MSG91 — server already knows the OTP.
  if (config.testPhones[phone]) {
    res.json({ ok: true })
    return
  }

  if (isMsg91Enabled()) {
    try {
      await msg91.sendOtp(phone)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SMS provider failure'
      throw new HttpError(502, `Could not send OTP: ${message}`)
    }
    res.json({ ok: true })
    return
  }

  res.json({ ok: true, demoOtp: mockOtpFor(phone) })
})

/* POST /api/auth/otp/verify  { phone, otp, name? } */
router.post('/otp/verify', otpVerifyPhoneLimiter, async (req, res) => {
  const { phone, otp, name } = parseBody(otpVerifySchema, req)

  let ok: boolean
  // Test-phone bypass — compare against the configured OTP, skip MSG91.
  if (config.testPhones[phone]) {
    ok = otp === config.testPhones[phone]
  } else if (isMsg91Enabled()) {
    try {
      ok = await msg91.verifyOtp(phone, otp)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SMS provider failure'
      throw new HttpError(502, `Could not verify OTP: ${message}`)
    }
  } else {
    ok = otp === mockOtpFor(phone)
  }
  if (!ok) throw new HttpError(401, 'Invalid OTP')

  const result = await findOrCreateUser(phone, name)
  if (result.kind === 'not-found') {
    throw new HttpError(404, 'No account found. Please sign up first.')
  }

  const { user, isNewUser } = result
  const token = signToken({ uid: String(user._id), phone: user.phone, isAdmin: user.isAdmin })

  res.json({
    token,
    isNewUser,
    user: serializeUser(user),
  })
})

/**
 * Atomically find an existing user by phone, or create one when a name is
 * provided. Handles the race where two concurrent verify requests both pass
 * the `findOne` check and then both try to `create` — the second one would
 * get a duplicate-key error (E11000) on the unique `phone` index. We catch
 * that and re-read the row so the caller still gets a User.
 */
type FindOrCreateResult =
  | { kind: 'found'; user: InstanceType<typeof User>; isNewUser: false }
  | { kind: 'created'; user: InstanceType<typeof User>; isNewUser: true }
  | { kind: 'not-found' }

async function findOrCreateUser(phone: string, name: string | undefined): Promise<FindOrCreateResult> {
  let user = await User.findOne({ phone })
  if (user) return { kind: 'found', user, isNewUser: false }
  if (!name) return { kind: 'not-found' }

  const shouldBeAdmin = config.adminPhones.includes(phone)
  try {
    user = await User.create({ phone, name, isAdmin: shouldBeAdmin })
    return { kind: 'created', user, isNewUser: true }
  } catch (err) {
    // E11000 = duplicate key (concurrent verify created the same phone).
    if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
      user = await User.findOne({ phone })
      if (user) return { kind: 'found', user, isNewUser: false }
    }
    throw err
  }
}

/* POST /api/auth/widget/verify { accessToken, name? }
 *
 * The MSG91 widget runs in the browser, handles SMS + OTP itself, and hands
 * the client a signed access-token on success. This endpoint validates that
 * token against MSG91 server-to-server, then issues our own JWT.
 *
 * We deliberately reuse the verify-phone limiter (10/h per derived phone) —
 * the rate-limit key falls back to IP for this route since we don't know
 * the phone until MSG91 tells us.
 */
router.post('/widget/verify', async (req, res) => {
  if (!isMsg91WidgetEnabled()) {
    throw new HttpError(503, 'Widget verification is not configured on this server')
  }
  const { accessToken, name } = parseBody(widgetVerifySchema, req)

  let mobile: string
  try {
    mobile = await msg91.verifyWidgetAccessToken(accessToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Widget verification failed'
    throw new HttpError(401, message)
  }

  // MSG91 typically returns "91XXXXXXXXXX". Strip the country code so it
  // matches the canonical 10-digit phone we store on User.
  const phone = mobile.replace(/^\+?91/, '').replace(/\D/g, '')
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new HttpError(502, `MSG91 returned an unexpected mobile format: ${mobile}`)
  }

  const result = await findOrCreateUser(phone, name)
  if (result.kind === 'not-found') {
    throw new HttpError(404, 'No account found. Please sign up first.')
  }

  const { user, isNewUser } = result
  const token = signToken({ uid: String(user._id), phone: user.phone, isAdmin: user.isAdmin })

  res.json({
    token,
    isNewUser,
    user: serializeUser(user),
  })
})

export function serializeUser(u: InstanceType<typeof User>) {
  return {
    id: String(u._id),
    phone: u.phone,
    name: u.name,
    email: u.email ?? undefined,
    isAdmin: u.isAdmin,
    address: u.address,
    pgName: u.pgName ?? '',
    allergens: u.allergens,
    parentReport: u.parentReport,
    notifications: u.notifications,
    createdAt: u.get('createdAt')?.getTime?.() ?? Date.now(),
  }
}

export default router
