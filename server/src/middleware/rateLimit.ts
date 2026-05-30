import { rateLimit } from 'express-rate-limit'

/**
 * Rate limiters for the OTP endpoints.
 *
 * MSG91 charges per SMS, so unrate-limited `/otp/send` is a wallet-draining
 * vector for attackers (and a captcha-bypass vector for spammers). We layer
 * defence:
 *
 *   1. Per-IP   — 10 / minute, applied to all /otp/* endpoints
 *   2. Per-phone — 3 / hour    on /otp/send (the only path that costs money)
 *   3. Per-phone — 10 / hour   on /otp/verify (OTP brute-force protection;
 *                              MSG91 also enforces server-side, this is
 *                              defence-in-depth)
 *
 * The store is in-memory, which means rate limits are per-process. If we
 * ever scale horizontally, swap in `rate-limit-mongo` or `rate-limit-redis`.
 */

/**
 * Common options. `validate: false` disables express-rate-limit v7's strict
 * configuration validators — under Render's reverse proxy a few of them
 * (notably trustProxy & xForwardedForHeader) trip on benign setups and crash
 * the first request with ERR_ERL_PERMISSIVE_TRUST_PROXY. We've already set
 * `app.set('trust proxy', 1)` correctly in index.ts; the validators add no
 * extra safety in this deployment.
 */
const COMMON = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  validate: false,
}

/** Per-IP across all /otp/* paths. */
export const otpIpLimiter = rateLimit({
  ...COMMON,
  windowMs: 60_000,
  limit: 10,
  message: { error: 'Too many requests from this network. Please wait a minute and try again.' },
})

/** Per-phone on /otp/send — protects the SMS budget. */
export const otpSendPhoneLimiter = rateLimit({
  ...COMMON,
  windowMs: 60 * 60_000, // 1 hour
  limit: 3,
  keyGenerator: (req) => {
    const phone = String(req.body?.phone ?? '').trim()
    return phone || req.ip || '0.0.0.0'
  },
  message: { error: 'You\'ve requested too many OTPs for this number. Try again in an hour.' },
})

/** Per-phone on /otp/verify — defence-in-depth against OTP brute force. */
export const otpVerifyPhoneLimiter = rateLimit({
  ...COMMON,
  windowMs: 60 * 60_000, // 1 hour
  limit: 10,
  keyGenerator: (req) => {
    const phone = String(req.body?.phone ?? '').trim()
    return phone || req.ip || '0.0.0.0'
  },
  message: { error: 'Too many verification attempts. Request a new OTP after an hour.' },
})
