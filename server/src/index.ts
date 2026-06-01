import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { connectDb } from './db.js'
import { errorHandler, notFound } from './middleware/error.js'
import authRouter from './routes/auth.js'
import meRouter from './routes/me.js'
import subscriptionRouter from './routes/subscription.js'
import paymentsRouter from './routes/payments.js'
import adminRouter from './routes/admin.js'
import groupRouter from './routes/group.js'
import menuRouter from './routes/menu.js'
import uploadRouter from './routes/upload.js'
import qrRouter from './routes/qr.js'

async function start(): Promise<void> {
  // Startup visibility — surface the resolved allow-list BEFORE Mongo
  // connect, so config bugs are obvious even when the DB is slow / down.
  console.log(`✓ CORS allow-list: ${config.corsOrigins.join(', ') || '(none — every origin will be rejected)'}`)

  await connectDb()

  const app = express()
  app.disable('x-powered-by')
  // Required for rate-limit's per-IP keys to be correct when running behind a
  // reverse proxy (Render, Railway, Fly, Vercel functions, Nginx). The "1"
  // trusts the first hop; tune up for nested proxies.
  app.set('trust proxy', 1)
  // Compile CORS allow-list once. Each entry can be either an exact origin
  // ("https://bowled.app") or a wildcard pattern ("https://*.vercel.app" or
  // "https://bowled-*.vercel.app"). Wildcards make Vercel preview deploys
  // work without re-editing the env on every PR.
  const corsMatchers: Array<(s: string) => boolean> = config.corsOrigins.map((entry) => {
    if (!entry.includes('*')) {
      return (origin) => origin === entry
    }
    const re = new RegExp(
      '^' + entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
    )
    return (origin) => re.test(origin)
  })

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / curl / server-to-server (no Origin header).
        if (!origin) return cb(null, true)
        const normalised = origin.replace(/\/$/, '').toLowerCase()
        if (corsMatchers.some((m) => m(normalised))) return cb(null, true)
        // Pass an Error so the centralised error handler can convert it to a
        // proper 403 with the actual origin in the message (was silently
        // returning 500 'Internal server error' before).
        cb(new Error(`Origin ${origin} not allowed by CORS`))
      },
      credentials: false,
    }),
  )
  // 10mb covers a ~7mb base64-encoded image (Cloudinary uploads).
  app.use(express.json({ limit: '10mb' }))

  // Tiny request log — one line per request with method + path + status +
  // duration. Skips the noisy /api/health endpoint. Enough to debug production
  // without dragging in a full logger.
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next()
    const started = Date.now()
    res.on('finish', () => {
      console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - started}ms)`)
    })
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'bowled-server', env: config.nodeEnv })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/me', meRouter)
  app.use('/api/subscription', subscriptionRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/group', groupRouter)
  app.use('/api/menu', menuRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/qr', qrRouter)

  if (config.upi.id) {
    console.log(`✓ UPI payments active (${config.upi.id} · ${config.upi.name})`)
  } else {
    console.warn('! BUSINESS_UPI_ID not set — new subscribers will see "payments not configured" until you set it.')
  }

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
