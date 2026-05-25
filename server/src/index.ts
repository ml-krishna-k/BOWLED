import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { connectDb } from './db.js'
import { errorHandler, notFound } from './middleware/error.js'
import authRouter from './routes/auth.js'
import meRouter from './routes/me.js'
import subscriptionRouter from './routes/subscription.js'
import adminRouter from './routes/admin.js'
import groupRouter from './routes/group.js'
import menuRouter from './routes/menu.js'
import uploadRouter from './routes/upload.js'
import qrRouter from './routes/qr.js'

async function start(): Promise<void> {
  await connectDb()

  const app = express()
  app.disable('x-powered-by')
  // Required for rate-limit's per-IP keys to be correct when running behind a
  // reverse proxy (Render, Railway, Fly, Vercel functions, Nginx). The "1"
  // trusts the first hop; tune up for nested proxies.
  app.set('trust proxy', 1)
  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / curl / server-to-server (no Origin header).
        if (!origin) return cb(null, true)
        const normalised = origin.replace(/\/$/, '')
        if (config.corsOrigins.includes(normalised)) return cb(null, true)
        cb(new Error(`Origin ${origin} not allowed by CORS`))
      },
      credentials: false,
    }),
  )
  // 10mb covers a ~7mb base64-encoded image (Cloudinary uploads).
  app.use(express.json({ limit: '10mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'bowled-server', env: config.nodeEnv })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/me', meRouter)
  app.use('/api/subscription', subscriptionRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/group', groupRouter)
  app.use('/api/menu', menuRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/qr', qrRouter)

  app.use(notFound)
  app.use(errorHandler)

  app.listen(config.port, () => {
    console.log(`✓ Bowled API listening on http://localhost:${config.port}`)
  })
}

start().catch((err) => {
  console.error('✗ Failed to start server:', err)
  process.exit(1)
})
