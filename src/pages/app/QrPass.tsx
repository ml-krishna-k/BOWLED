import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { api } from '@/lib/api'

// Server tokens last 60s — rotate just before they expire.
const TOKEN_REFRESH_MS = 45_000
// Subscription state poll. Kept tight so that when admin scans the customer's
// QR from the in-app scanner, the user sees their meal flip to "served"
// within a few seconds rather than waiting for the next token rotation.
const SUB_POLL_MS = 5_000

export function QrPass() {
  const { user } = useAuth()
  const { sub, nextSlot, scanMeal, mealsRemaining, refresh: refreshSub } = useSubscription()
  const [pulse, setPulse] = useState(false)
  const [justServed, setJustServed] = useState<string | null>(null)

  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)

  const mintToken = useCallback(async () => {
    setTokenLoading(true)
    setTokenError(null)
    try {
      const { token: t } = await api<{ token: string; expiresIn: number }>('/api/qr/token')
      setToken(t)
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : 'Could not mint QR token')
    } finally {
      setTokenLoading(false)
    }
  }, [])

  // Mint on mount + rotate every 45s.
  useEffect(() => {
    void mintToken()
    const id = setInterval(() => {
      void mintToken()
    }, TOKEN_REFRESH_MS)
    return () => clearInterval(id)
  }, [mintToken])

  // Tight subscription poll — when admin scans the QR, the user's view flips
  // to "served" within ~5s without waiting for the next token rotation.
  useEffect(() => {
    const id = setInterval(() => {
      void refreshSub()
    }, SUB_POLL_MS)
    return () => clearInterval(id)
  }, [refreshSub])

  if (!sub || !user) return null

  // What the rider's phone camera opens when they scan.
  const scanUrl = token ? `${window.location.origin}/scan/${token}` : ''
  const shortCode = token ? token.slice(-8).toUpperCase() : '········'

  async function simulateScan() {
    const result = await scanMeal()
    if (result) {
      setJustServed(result.mealName)
      setPulse(true)
      setTimeout(() => setPulse(false), 1200)
      setTimeout(() => setJustServed(null), 4000)
    }
  }

  return (
    <AppContainer className="max-w-3xl">
      <PageHeader
        eyebrow="QR meal pass"
        chapter="Live"
        title={<>One scan. <span className="italic font-light text-saffron-600">One meal off.</span></>}
        description="Show this to the delivery person. They scan once, your meal counter drops by one."
      />

      <Card className="mt-8 sm:mt-10 p-6 sm:p-8 lg:p-12 grid place-items-center text-center relative overflow-hidden ring-inset-warm">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-saffron-200/40 blur-3xl animate-breathe"
        />
        <div className="relative text-eyebrow text-saffron-700">{user.name} · +91 {user.phone}</div>

        <div className="relative mt-6">
          {/* Pulse ring while scanning */}
          {pulse && (
            <div
              aria-hidden
              className="absolute inset-0 -m-4 rounded-3xl bg-leaf-300/50 animate-ping"
            />
          )}
          {/* QR — real, scannable; encodes /scan/:token URL */}
          <div className="relative h-52 w-52 sm:h-60 sm:w-60 lg:h-64 lg:w-64 rounded-3xl bg-paper border border-cream-200 p-3 sm:p-4 shadow-card grid place-items-center">
            {scanUrl ? (
              <QRCodeSVG
                value={scanUrl}
                size={224}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#1f1a12"
              />
            ) : (
              <div className="text-sm text-ink-500">
                {tokenError ? 'Could not load QR' : tokenLoading ? 'Generating QR…' : 'Loading…'}
              </div>
            )}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-saffron-500 text-cream-50 font-display text-xl shadow-glow ring-4 ring-paper">
                B
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 font-mono text-xs tracking-widest text-ink-500">PASS · {shortCode}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Badge tone="leaf">Auto-debit on scan</Badge>
          <Badge tone="cream">Refreshes every 45s</Badge>
          <Badge tone="paper">{mealsRemaining} meals left</Badge>
        </div>

        {tokenError && (
          <p className="mt-3 text-xs text-spice-700">{tokenError}</p>
        )}

        {nextSlot ? (
          <p className="mt-5 text-ink-500">
            Next scan will mark today's{' '}
            <span className="font-medium text-ink-900">{nextSlot}</span> as served.
          </p>
        ) : (
          <p className="mt-5 text-leaf-700 font-medium">
            All 3 meals served for today. ✓
          </p>
        )}

        {justServed && (
          <div className="mt-4 rounded-2xl bg-leaf-100 border border-leaf-300 px-4 py-3 text-sm text-leaf-700">
            ✓ Scanned. <span className="font-semibold">{justServed}</span> marked as served. Plan auto-updated.
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={simulateScan}
            disabled={!nextSlot}
          >
            {nextSlot ? 'Simulate delivery scan' : 'No pending meal'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void mintToken()}
            disabled={tokenLoading}
          >
            {tokenLoading ? 'Refreshing…' : 'Refresh QR'}
          </Button>
        </div>

        <p className="mt-5 text-[11px] text-ink-400 max-w-sm">
          The rider scans this with any phone camera — it opens a one-tap confirmation page that marks the meal as served. "Simulate scan" does the same locally for testing.
        </p>
      </Card>

      {/* Recent scans — editorial log */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-eyebrow text-ink-500">Recent scans</p>
            <h2 className="mt-1.5 text-display text-2xl tracking-tight text-ink-900">
              Your meal log.
            </h2>
          </div>
          <p className="caption text-xs text-ink-500">
            <span className="not-italic font-semibold text-ink-900">{sub.history.length}</span> total
          </p>
        </div>
        <div className="hairline" />
        {sub.history.length === 0 ? (
          <p className="py-8 caption text-ink-500 text-center">
            Nothing yet. Your scan history will live here.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200/70">
            {sub.history.slice(0, 8).map((h, i) => (
              <li key={h.scannedAt} className="flex items-baseline justify-between py-4 gap-4">
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className="text-chapter text-sm text-ink-300 tabular-nums shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{h.mealName}</p>
                    <p className="caption text-xs text-ink-500">
                      Day {h.day} · {h.slot} ·{' '}
                      {new Date(h.scannedAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Badge tone="leaf">−1 meal</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="hairline" />
      </section>
    </AppContainer>
  )
}
