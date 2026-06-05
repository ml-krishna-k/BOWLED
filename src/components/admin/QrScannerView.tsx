/**
 * Reusable QR scanner surface used by the admin Deliveries page.
 *
 * Reads a subscriber's QR pass via the device camera, extracts the embedded
 * JWT (the QR encodes `${origin}/scan/{jwt}`), and POSTs it to the public
 * `/api/qr/redeem` endpoint — the server marks the subscriber's next pending
 * meal as served and returns the slot + counters.
 *
 * Lives in `components/admin/` rather than its own page so that it can be
 * dropped into a modal on the Deliveries page (the request was: only have
 * a single "Deliveries" nav item, and clicking "Scan QR" from there opens
 * the real camera, not a fake confirm).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Button } from '@/components/ui/Button'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'

export interface ScanResult {
  ok: true
  slot: 'breakfast' | 'lunch' | 'dinner'
  /** Server-resolved subscriber id, used by the Deliveries page to flip the
   *  matching delivery row to served locally. */
  subscriberId?: string
  mealsServed: number
  mealsRemaining: number
}

type Stage =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'redeeming'; token: string }
  | { kind: 'success'; result: ScanResult }
  | { kind: 'error'; message: string; reason?: string }

function extractToken(raw: string): string | null {
  const cleaned = raw.trim()
  if (!cleaned) return null
  const m = cleaned.match(/\/scan\/([^/?#\s]+)/)
  if (m) return m[1]
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(cleaned)) return cleaned
  return null
}

const SCAN_COOLDOWN_MS = 2500

export interface QrScannerViewProps {
  /** Called after a successful redeem, before the user dismisses the success
   *  overlay. The Deliveries page uses this to refresh its list so the row
   *  flips to "served" immediately. */
  onSuccess?: (result: ScanResult) => void
  /** Called when the user closes the scanner (top-right ✕ or success Done). */
  onClose?: () => void
}

export function QrScannerView({ onSuccess, onClose }: QrScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const lastTokenRef = useRef<{ token: string; at: number } | null>(null)

  const [stage, setStage] = useState<Stage>({ kind: 'idle' })
  const [cameraReady, setCameraReady] = useState(false)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)

  const redeem = useCallback(
    async (token: string) => {
      setStage({ kind: 'redeeming', token })
      try {
        const result = await api<ScanResult>('/api/qr/redeem', {
          method: 'POST',
          body: { token },
        })
        setStage({ kind: 'success', result })
        onSuccess?.(result)
      } catch (err) {
        if (err instanceof ApiError) {
          setStage({ kind: 'error', message: err.message, reason: err.reason })
        } else {
          setStage({ kind: 'error', message: 'Could not reach server' })
        }
      }
    },
    [onSuccess],
  )

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return
    if (scannerRef.current) return

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const token = extractToken(result.data)
          if (!token) return
          const now = Date.now()
          const last = lastTokenRef.current
          if (last && last.token === token && now - last.at < SCAN_COOLDOWN_MS) return
          lastTokenRef.current = { token, at: now }
          void redeem(token)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
        },
      )
      scannerRef.current = scanner
      await scanner.start()
      setCameraReady(true)
      const flash = await scanner.hasFlash()
      setHasFlash(flash)
      setStage({ kind: 'scanning' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStage({
        kind: 'error',
        message: /denied|notallowed/i.test(msg)
          ? 'Camera access was blocked. Allow it in your browser settings and reload.'
          : `Could not start camera: ${msg}`,
      })
    }
  }, [redeem])

  const stopScanner = useCallback(() => {
    scannerRef.current?.stop()
    scannerRef.current?.destroy()
    scannerRef.current = null
    setCameraReady(false)
    setFlashOn(false)
  }, [])

  useEffect(() => {
    void startScanner()
    return () => stopScanner()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scanAnother() {
    lastTokenRef.current = null
    setStage({ kind: 'scanning' })
  }

  async function toggleFlash() {
    if (!scannerRef.current || !hasFlash) return
    try {
      if (flashOn) {
        await scannerRef.current.turnFlashOff()
        setFlashOn(false)
      } else {
        await scannerRef.current.turnFlashOn()
        setFlashOn(true)
      }
    } catch { /* best-effort */ }
  }

  const showOverlay = stage.kind === 'success' || stage.kind === 'error' || stage.kind === 'redeeming'

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4 lg:gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-ink-900">
        <div className="relative aspect-[3/4] sm:aspect-video lg:aspect-[4/3] w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />

          {!cameraReady && stage.kind !== 'error' && (
            <div className="absolute inset-0 grid place-items-center text-cream-50/80">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 rounded-full border-2 border-cream-50/30 border-t-cream-50 animate-spin" />
                <p className="mt-3 caption text-cream-50/70">Starting camera…</p>
              </div>
            </div>
          )}

          {showOverlay && (
            <ResultOverlay stage={stage} onDismiss={scanAnother} />
          )}

          {cameraReady && stage.kind === 'scanning' && hasFlash && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
              <button
                type="button"
                onClick={toggleFlash}
                className={cn(
                  'pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-card backdrop-blur-sm transition-colors',
                  flashOn ? 'bg-saffron-500 text-cream-50' : 'bg-paper/90 text-ink-900',
                )}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 4 13h7l-1 9 9-11h-7l1-9z" />
                </svg>
                {flashOn ? 'Flash on' : 'Flash off'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-paper border border-cream-200 p-5">
          <p className="text-eyebrow text-saffron-600">Status</p>
          <p className="mt-2 text-display text-xl text-ink-900 tracking-tight">
            {stage.kind === 'scanning' && 'Looking for a QR…'}
            {stage.kind === 'redeeming' && 'Verifying…'}
            {stage.kind === 'success' && 'Meal served ✓'}
            {stage.kind === 'error' && 'Could not redeem'}
            {stage.kind === 'idle' && 'Initialising'}
          </p>
          {stage.kind === 'scanning' && (
            <p className="mt-2 caption text-ink-500">
              Hold the camera 4–6 inches from the subscriber's QR. Auto-detects.
            </p>
          )}
          {stage.kind === 'success' && (
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Slot served" value={stage.result.slot} caps />
              <Row label="Meals remaining" value={`${stage.result.mealsRemaining}`} />
              <Row label="Total served" value={`${stage.result.mealsServed}`} />
            </div>
          )}
          {stage.kind === 'error' && (
            <p className="mt-3 text-sm text-spice-700">{stage.message}</p>
          )}

          {(stage.kind === 'success' || stage.kind === 'error') && (
            <div className="mt-5 grid gap-2">
              <Button variant="secondary" size="md" onClick={scanAnother}>
                Scan another
              </Button>
              {onClose && (
                <Button variant="ghost" size="md" onClick={onClose}>
                  Done
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-cream-100 p-4 text-[12px] text-ink-500 leading-relaxed">
          QR tokens expire after 60 seconds. If you get an "expired" error, ask
          the subscriber to refresh their pass.
        </div>
      </div>
    </div>
  )
}

function ResultOverlay({ stage, onDismiss }: { stage: Stage; onDismiss: () => void }) {
  const isSuccess = stage.kind === 'success'
  const isError = stage.kind === 'error'
  const isRedeeming = stage.kind === 'redeeming'

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink-900/70 backdrop-blur-sm p-6 animate-fade-up">
      <div className="text-center max-w-xs">
        {isRedeeming && (
          <>
            <div className="mx-auto h-14 w-14 rounded-full border-3 border-cream-50/30 border-t-cream-50 animate-spin" />
            <p className="mt-4 font-display text-xl text-cream-50">Verifying…</p>
          </>
        )}

        {isSuccess && (
          <>
            <div className="mx-auto h-20 w-20 grid place-items-center rounded-full bg-leaf-500 text-cream-50 text-4xl shadow-glow animate-fade-up">
              ✓
            </div>
            <p className="mt-4 font-display text-2xl text-cream-50">Meal served</p>
            <p className="mt-1.5 caption text-cream-50/80 capitalize">
              {stage.result.slot} · {stage.result.mealsRemaining} meals left
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-cream-50 text-ink-900 px-5 py-2.5 text-sm font-semibold shadow-card active:scale-95"
            >
              Scan another
            </button>
          </>
        )}

        {isError && (
          <>
            <div className="mx-auto h-20 w-20 grid place-items-center rounded-full bg-spice-500 text-cream-50 text-3xl shadow-card">
              !
            </div>
            <p className="mt-4 font-display text-2xl text-cream-50">Could not redeem</p>
            <p className="mt-1.5 caption text-cream-50/80">{stage.message}</p>
            {stage.reason === 'expired' && (
              <p className="mt-1.5 caption text-xs text-cream-50/60">
                QR codes expire after 60 seconds.
              </p>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-cream-50 text-ink-900 px-5 py-2.5 text-sm font-semibold shadow-card active:scale-95"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, caps }: { label: string; value: string; caps?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-cream-200/70 last:border-b-0">
      <span className="text-eyebrow text-xs text-ink-500">{label}</span>
      <span className={cn('font-medium text-ink-900', caps && 'capitalize')}>{value}</span>
    </div>
  )
}
