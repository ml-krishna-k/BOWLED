import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'

interface RedeemResult {
  ok: true
  slot: 'breakfast' | 'lunch' | 'dinner'
  mealsServed: number
  mealsRemaining: number
}

type Status =
  | { kind: 'loading' }
  | { kind: 'ok'; data: RedeemResult }
  | { kind: 'error'; message: string; reason?: string }

/**
 * Public landing page that fires when a rider scans the subscriber's QR.
 * No login needed — the signed JWT in the URL is the authorisation. The page
 * auto-calls /api/qr/redeem on mount and shows a thumbs-up or a clear error.
 */
export function ScanPage() {
  const { token = '' } = useParams<{ token: string }>()
  const [status, setStatus] = useState<Status>({ kind: 'loading' })

  useEffect(() => {
    if (!token) {
      setStatus({ kind: 'error', message: 'No QR token in URL' })
      return
    }
    let cancelled = false
    api<RedeemResult>('/api/qr/redeem', {
      method: 'POST',
      body: { token },
    })
      .then((data) => {
        if (!cancelled) setStatus({ kind: 'ok', data })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError) {
          setStatus({ kind: 'error', message: err.message, reason: err.reason })
        } else {
          setStatus({ kind: 'error', message: 'Could not reach server — check your connection.' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="min-h-screen grid place-items-center bg-cream-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-card text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500 text-cream-50 font-display text-xl">
          B
        </div>
        <p className="mt-3 text-eyebrow text-saffron-700">Bowled · Rider scan</p>

        {status.kind === 'loading' && (
          <>
            <h1 className="mt-4 font-display text-2xl text-ink-900">Marking meal as served…</h1>
            <p className="mt-2 text-sm text-ink-500">One moment — verifying QR.</p>
          </>
        )}

        {status.kind === 'ok' && (
          <>
            <div className="mt-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700 text-3xl">
              ✓
            </div>
            <h1 className="mt-4 font-display text-2xl text-ink-900">Meal served</h1>
            <p className="mt-2 text-sm text-ink-700 capitalize">
              {status.data.slot} marked as served.
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {status.data.mealsRemaining} meals remaining in this plan.
            </p>
          </>
        )}

        {status.kind === 'error' && (
          <>
            <div className="mt-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-spice-50 text-spice-700 text-3xl">
              !
            </div>
            <h1 className="mt-4 font-display text-2xl text-ink-900">Couldn't redeem</h1>
            <p className="mt-2 text-sm text-ink-700">{status.message}</p>
            {status.reason === 'expired' && (
              <p className="mt-2 text-xs text-ink-500">
                QR codes expire after 60 seconds. Ask the subscriber to show a fresh one.
              </p>
            )}
          </>
        )}

        <Link
          to="/"
          className="mt-7 inline-block text-sm font-medium text-saffron-700 hover:underline"
        >
          ← Back to Bowled
        </Link>
      </div>
    </main>
  )
}
