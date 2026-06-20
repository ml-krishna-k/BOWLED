import { Router } from 'express'
import { OAuth2Client, type TokenPayload } from 'google-auth-library'
import { User } from '../models/User.js'
import { UserActivity } from '../models/UserActivity.js'
import { HttpError } from '../middleware/error.js'
import { signToken } from '../lib/jwt.js'
import { config, isGoogleAuthEnabled } from '../config.js'
import { parseBody } from '../lib/validate.js'
import { googleAuthSchema } from '../lib/schemas.js'
import { googleAuthIpLimiter } from '../middleware/rateLimit.js'

const router = Router()

// Lazy singleton — verifies the audience matches OUR client id, which is
// the core defence against token replay from a different Google project.
let _gsiClient: OAuth2Client | null = null
function gsiClient(): OAuth2Client {
  if (!_gsiClient) _gsiClient = new OAuth2Client(config.google.clientId)
  return _gsiClient
}

/**
 * POST /api/auth/google  { credential }
 *
 * `credential` is the Google ID token issued to the browser by Google
 * Identity Services after the user clicks "Sign in with Google". We:
 *
 *   1. Verify the JWT against Google's public keys (handled by the SDK)
 *   2. Confirm the `aud` matches our OAuth client id
 *   3. Confirm the email is verified (`email_verified: true`)
 *   4. Upsert a User keyed by Google's stable `sub` (user id)
 *   5. Promote to admin if the email is in ADMIN_EMAILS
 *   6. Issue our own session JWT and return { token, user }
 */
router.post('/google', googleAuthIpLimiter, async (req, res) => {
  if (!isGoogleAuthEnabled()) {
    throw new HttpError(503, 'Google sign-in is not configured on this server', { reason: 'google-disabled' })
  }
  const { credential } = parseBody(googleAuthSchema, req)

  let payload: TokenPayload
  try {
    const ticket = await gsiClient().verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    })
    const p = ticket.getPayload()
    if (!p) throw new Error('Empty Google token payload')
    payload = p
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid Google credential'
    throw new HttpError(401, `Google sign-in failed: ${message}`, { reason: 'invalid-credential' })
  }

  if (!payload.sub) {
    throw new HttpError(401, 'Google token missing sub claim', { reason: 'invalid-credential' })
  }
  if (!payload.email || !payload.email_verified) {
    throw new HttpError(401, 'Google account email is not verified', { reason: 'email-unverified' })
  }

  const email = payload.email.toLowerCase()
  const isAdminEmail = config.adminEmails.includes(email)

  const { user, isNewUser } = await upsertGoogleUser({
    googleSub: payload.sub,
    email,
    name: payload.name ?? email.split('@')[0],
    picture: payload.picture ?? '',
    isAdminEmail,
  })

  // Log the auth event so admins get a notification feed of who came through.
  // Best-effort — a failure here must not block sign-in. Trust-proxy is set
  // at the app level, so req.ip resolves to the real client IP behind Render.
  try {
    await UserActivity.create({
      userId: user._id,
      kind: isNewUser ? 'register' : 'login',
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      ipAddress: req.ip ?? '',
      userAgent: req.get('user-agent')?.slice(0, 300) ?? '',
      at: Date.now(),
    })
  } catch (err) {
    console.warn('[auth] failed to record UserActivity:', err)
  }

  const token = signToken({ uid: String(user._id), email: user.email, isAdmin: user.isAdmin })

  res.json({
    token,
    isNewUser,
    user: serializeUser(user),
  })
})

/**
 * Atomically find-or-create a user by Google `sub`. On every login we keep
 * the email + name + picture + admin flag in sync with what Google sent
 * (cheap to update, useful when a user changes their Google profile or is
 * added to ADMIN_EMAILS post-signup).
 */
async function upsertGoogleUser(input: {
  googleSub: string
  email: string
  name: string
  picture: string
  isAdminEmail: boolean
}): Promise<{ user: InstanceType<typeof User>; isNewUser: boolean }> {
  const existing = await User.findOne({ googleSub: input.googleSub })
  if (existing) {
    // Refresh fields that may have changed since signup.
    existing.email = input.email
    existing.name = input.name
    existing.picture = input.picture
    // Don't downgrade an existing admin — only promote.
    if (input.isAdminEmail && !existing.isAdmin) existing.isAdmin = true
    await existing.save()
    return { user: existing, isNewUser: false }
  }

  try {
    const created = await User.create({
      googleSub: input.googleSub,
      email: input.email,
      name: input.name,
      picture: input.picture,
      isAdmin: input.isAdminEmail,
    })
    return { user: created, isNewUser: true }
  } catch (err) {
    // E11000 = duplicate key (concurrent signup raced us, or an existing
    // user has the same email from a previous account). Try to recover by
    // re-reading by sub first, then by email as a fallback.
    if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
      const fallback = await User.findOne({ googleSub: input.googleSub })
        ?? await User.findOne({ email: input.email })
      if (fallback) return { user: fallback, isNewUser: false }
    }
    throw err
  }
}

export function serializeUser(u: InstanceType<typeof User>) {
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    picture: u.picture ?? '',
    isAdmin: u.isAdmin,
    phone: u.phone ?? '',
    address: u.address,
    pgName: u.pgName ?? '',
    allergens: u.allergens,
    parentReport: u.parentReport,
    notifications: u.notifications,
    createdAt: u.get('createdAt')?.getTime?.() ?? Date.now(),
  }
}

export default router
