import { rateLimit } from 'express-rate-limit'

/**
 * Rate limiters for the auth endpoint.
 *
 * Google ID-token verification is cheap (Google's JWKS is cached locally by
 * the SDK after first use), so the limiter is more about blocking abuse —
 * a flood of forged credentials or a denial-of-service against the verify
 * path. Per-IP cap of 20/minute is plenty for a real user (they'll only
 * verify once per session) and stops the most obvious abuse.
 *
 * Store is in-memory, so limits are per-process. For horizontal scale
 * swap in `rate-limit-mongo` or `rate-limit-redis`.
 */

const COMMON = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  // Disable express-rate-limit v7's strict validators — under Render's
  // reverse proxy a few of them (notably trustProxy & xForwardedForHeader)
  // trip on benign setups. `app.set('trust proxy', 1)` in index.ts is the
  // real safeguard.
  validate: false,
}

/** Per-IP cap on POST /api/auth/google. */
export const googleAuthIpLimiter = rateLimit({
  ...COMMON,
  windowMs: 60_000,
  limit: 20,
  message: { error: 'Too many sign-in attempts. Please wait a minute and try again.' },
})
