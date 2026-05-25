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

  // Mint on mount + rotate every 45s. Refresh subscription state after each
  // rotation so the "Recent scans" list catches anything redeemed via the QR.
  useEffect(() => {
    void mintToken()
    const id = setInterval(() => {
      void mintToken()
      void refreshSub()
    }, TOKEN_REFRESH_MS)
    return () => clearInterval(id)
  }, [mintToken, refreshSub])

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
        title="One scan. One meal off."
        description="Show this to the delivery person. They scan once, your meal counter drops by one."
      />

      <Card className="mt-8 p-8 sm:p-10 grid place-items-center text-center">
        <div className="text-eyebrow text-saffron-700">{user.name} · +91 {user.phone}</div>

        <div className="relative mt-6">
          {/* Pulse ring while scanning */}
          {pulse && (
            <div
              aria-hidden
              className="absolute inset-0 -m-4 rounded-3xl bg-leaf-300/50 animate-ping"
            />
          )}
          {/* QR — real, scannable; encodes /scan/:token URL */}
          <div className="relative h-56 w-56 sm:h-64 sm:w-64 rounded-3xl bg-paper border border-cream-200 p-4 shadow-card grid place-items-center">
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

      {/* Recent scans */}
      <Card variant="soft" className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900">Recent scans</h2>
          <p className="text-xs text-ink-500">{sub.history.length} total</p>
        </div>
        {sub.history.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Nothing yet. Your scan history will live here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-cream-200">
            {sub.history.slice(0, 8).map((h) => (
              <li key={h.scannedAt} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink-900">{h.mealName}</p>
                  <p className="text-xs text-ink-500">
                    Day {h.day} · {h.slot} ·{' '}
                    {new Date(h.scannedAt).toLocaleTimeString('en-IN', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Badge tone="leaf">−1 meal</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppContainer>
  )
}
