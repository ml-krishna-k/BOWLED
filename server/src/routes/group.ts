import { Router } from 'express'
import { Subscription } from '../models/Subscription.js'
import { User } from '../models/User.js'
import { HttpError } from '../middleware/error.js'

const router = Router()

/* GET /api/group/:code
 *
 * Public endpoint — prospective signups call this to preview a group before
 * joining. Returns enough info to render a "you're about to join X" card,
 * but no PII beyond first names.
 */
router.get('/:code', async (req, res) => {
  const code = String(req.params.code ?? '').trim()
  if (code.length < 3) throw new HttpError(400, 'Invalid group code')

  const members = await Subscription.find({ groupCode: code }).populate('userId', 'name address')
  if (members.length === 0) throw new HttpError(404, 'No group with that code')

  const first = members[0]
  const previewMembers = members.slice(0, 8).map((s) => {
    const u = s.userId as unknown as InstanceType<typeof User>
    return {
      firstName: (u.name ?? '').split(' ')[0] || 'Member',
      joinedAt: s.startedAt,
    }
  })

  res.json({
    group: {
      groupCode: code,
      planId: first.planId,
      billingCycleId: first.billingCycleId,
      groupSize: members.length,
      area: (first.userId as unknown as InstanceType<typeof User>).address?.area ?? 'Chennai',
      members: previewMembers,
    },
  })
})

export default router
