import { Router } from 'express'
import { User } from '../models/User.js'
import { HttpError } from '../middleware/error.js'
import { signToken } from '../lib/jwt.js'
import { config, isMsg91Enabled } from '../config.js'
import * as msg91 from '../lib/msg91.js'
import { parseBody } from '../lib/validate.js'
import { otpSendSchema, otpVerifySchema } from '../lib/schemas.js'
import {
  otpIpLimiter,
  otpSendPhoneLimiter,
  otpVerifyPhoneLimiter,
} from '../middleware/rateLimit.js'

const router = Router()

// Every /otp/* request first passes the per-IP limiter (10/min).
router.use('/otp', otpIpLimiter)

/** Deterministic dev OTP — only used when MSG91 is not configured. */
function mockOtpFor(phone: string): string {
  return phone.slice(-4) + '00'
}

/* POST /api/auth/otp/send  { phone } */
router.post('/otp/send', otpSendPhoneLimiter, async (req, res) => {
  const { phone } = parseBody(otpSendSchema, req)

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
  if (isMsg91Enabled()) {
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

  let user = await User.findOne({ phone })
  let isNewUser = false

  if (!user) {
    if (!name) {
      throw new HttpError(404, 'No account found. Please sign up first.')
    }
    const shouldBeAdmin = config.adminPhones.includes(phone)
    user = await User.create({ phone, name, isAdmin: shouldBeAdmin })
    isNewUser = true
  }

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
