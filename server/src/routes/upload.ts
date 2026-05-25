import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { parseBody } from '../lib/validate.js'
import { uploadImageSchema } from '../lib/schemas.js'
import { isCloudinaryEnabled } from '../config.js'
import { uploadDataUri } from '../lib/cloudinary.js'
import { HttpError } from '../middleware/error.js'

const router = Router()

/* POST /api/upload/image — admin-only.
 * Body: { data: "data:image/jpeg;base64,...", folder?: "menu" }
 * Returns: { url, publicId, width, height }
 */
router.post('/image', requireAuth, requireAdmin, async (req, res) => {
  if (!isCloudinaryEnabled()) {
    throw new HttpError(503, 'Image upload is not configured on this server')
  }
  const { data, folder } = parseBody(uploadImageSchema, req)
  const img = await uploadDataUri(data, { folder })
  res.json(img)
})

export default router
