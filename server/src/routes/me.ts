import { Router } from 'express'
import { User } from '../models/User.js'
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
  const user = await User.findByIdAndUpdate(req.auth!.uid, patch, { new: true })
  if (!user) throw new HttpError(404, 'User not found')
  res.json({ user: serializeUser(user) })
})

export default router
