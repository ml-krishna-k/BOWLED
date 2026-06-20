import { Router } from 'express'
import { User } from '../models/User.js'
import { UserActivity } from '../models/UserActivity.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../middleware/error.js'
import { parseBody } from '../lib/validate.js'
import { updateMeSchema } from '../lib/schemas.js'
import { serializeUser } from './auth.js'

const router = Router()

router.use(requireAuth)

/* GET /api/me */
router.get('/', async (req, res) => {
  const user = await User.findById(req.auth!.uid)
  if (!user) throw new HttpError(404, 'User not found')
  res.json({ user: serializeUser(user) })
})

/* PATCH /api/me */
router.patch('/', async (req, res) => {
  const patch = parseBody(updateMeSchema, req)

  // Capture the pre-patch phone so we can detect first-time phone entry
  // and emit a 'profile_completed' activity (admins want to know when a
  // user completes the mobile-number prompt that ran after Google login).
  const before = await User.findById(req.auth!.uid)
  if (!before) throw new HttpError(404, 'User not found')
  const hadPhone = !!(before.phone && before.phone.length > 0)

  const user = await User.findByIdAndUpdate(req.auth!.uid, patch, { new: true })
  if (!user) throw new HttpError(404, 'User not found')

  const nowHasPhone = !!(user.phone && user.phone.length > 0)
  if (!hadPhone && nowHasPhone) {
    try {
      await UserActivity.create({
        userId: user._id,
        kind: 'profile_completed',
        name: user.name,
        email: user.email,
        phone: user.phone,
        ipAddress: req.ip ?? '',
        userAgent: req.get('user-agent')?.slice(0, 300) ?? '',
        at: Date.now(),
      })
    } catch (err) {
      console.warn('[me] failed to record profile_completed activity:', err)
    }
  }

  res.json({ user: serializeUser(user) })
})

export default router
