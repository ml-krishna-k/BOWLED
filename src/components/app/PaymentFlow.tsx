/**
 * Pending-payment screen shown to subscribers in the `pending_payment` state.
 *
 * Renders:
 *   - UPI QR code (scannable from any UPI app)
 *   - UPI ID + amount + order ref, each copyable
 *   - Upload form: screenshot + UTR
 *   - "Already submitted" panel once the user has a pending_verification
 *     payment, with auto-refresh so approval shows up
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'
import { listMyPayments, submitPayment, uploadPaymentScreenshot } from '@/lib/payments'
import { useSubscription } from '@/context/SubscriptionContext'
import { inr } from '@/lib/format'
import type { PaymentInstructions, PaymentRecord } from '@/types'
import { cn } from '@/lib/cn'

interface PaymentFlowProps {
  instructions: PaymentInstructions
}

export function PaymentFlow({ instructions }: PaymentFlowProps) {
  const { refresh, reset } = useSubscription()

  const [pending, setPending] = useState<PaymentRecord | null>(null)
  const [latestRejected, setLatestRejected] = useState<PaymentRecord | null>(null)
  const [loadingPayments, setLoadingPayments] = useState(true)

  // Load existing payments so we know if the user has already submitted.
  const loadPayments = useCallback(async () => {
    try {
      const items = await listMyPayments()
      setPending(items.find((p) => p.status === 'pending_verification') ?? null)
      setLatestRejected(items.find((p) => p.status === 'rejected') ?? null)
    } catch {
      /* transient — leave existing state */
    } finally {
      setLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

  // While the user has a pending submission, poll every 15s so admin
  // approval flips the screen without a manual refresh.
  useEffect(() => {
    if (!pending) return
    const id = setInterval(() => {
      void loadPayments()
      void refresh()
    }, 15_000)
    return () => clearInterval(id)
  }, [pending, loadPayments, refresh])

  if (loadingPayments) {
    return (
      <div className="py-20 text-center caption text-ink-500">Loading payment status…</div>
    )
  }

  return (
    <div className="space-y-10">
      <PaymentInstructions instructions={instructions} />

      {pending ? (
        <PendingVerification payment={pending} />
      ) : (
        <UploadForm
          instructions={instructions}
          rejected={latestRejected}
          onSubmitted={async () => {
            await loadPayments()
            await refresh()
          }}
        />
      )}

      <div className="text-center">
        <button
          onClick={async () => {
            if (!confirm('Cancel this subscription and start over?')) return
            await reset()
          }}
          className="caption text-ink-500 hover:text-spice-700 underline underline-offset-4"
        >
          Cancel and pick a different plan
        </button>
      </div>
    </div>
  )
}

/* ---------- Payment instructions card (UPI QR + details) ----------------- */

function PaymentInstructions({ instructions }: { instructions: PaymentInstructions }) {
  const { orderRef, amount, upiId, businessName, upiUri, submitExpiresAt } = instructions

  const expiresIn = useMemo(() => formatRemaining(submitExpiresAt), [submitExpiresAt])

  return (
    <Card className="overflow-hidden p-0 ring-inset-warm">
      <div className="grid md:grid-cols-2">
        {/* QR + open-in-UPI side. On mobile the deep-link button takes
            priority over the QR (you can't scan your own screen). */}
        <div className="p-5 sm:p-7 lg:p-9 bg-cream-50/60 border-b md:border-b-0 md:border-r border-cream-200 flex flex-col items-center text-center">
          <p className="text-eyebrow text-saffron-700">Scan to pay</p>
          <div className="mt-4 sm:mt-5 rounded-3xl bg-paper p-4 sm:p-5 shadow-card ring-inset-warm">
            <QRCodeSVG
              value={upiUri}
              size={180}
              level="M"
              marginSize={1}
              bgColor="#ffffff"
              fgColor="#1f1a12"
              className="!w-[180px] !h-[180px] sm:!w-[200px] sm:!h-[200px]"
            />
          </div>
          <p className="mt-4 caption text-ink-500 max-w-xs text-[13px] sm:text-sm">
            Open Google Pay, PhonePe, Paytm or any UPI app and scan this code.
          </p>
          {/* Direct deep-link — taps straight into the UPI app on phones. */}
          <a
            href={upiUri}
            className="mt-4 inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-soft active:scale-95 transition-transform md:hidden"
          >
            Open in UPI app →
          </a>
        </div>

        {/* Details side */}
        <div className="p-5 sm:p-7 lg:p-9 flex flex-col">
          <p className="text-eyebrow text-ink-500">Payment details</p>
          <h3 className="mt-2 text-display text-xl sm:text-2xl lg:text-3xl tracking-tight text-ink-900">
            Pay <span className="italic font-light text-saffron-600">{inr(amount)}</span> to confirm
          </h3>
          <p className="mt-2 caption text-ink-500 text-[13px] sm:text-sm">
            Your plan activates once admin verifies the payment — usually within
            a few hours during business hours.
          </p>

          <div className="mt-6 space-y-3">
            <DetailRow label="Amount" value={inr(amount)} mono />
            <DetailRow label="UPI ID" value={upiId} copyable />
            <DetailRow label="Pay to" value={businessName} />
            <DetailRow label="Reference" value={orderRef} copyable mono />
          </div>

          <div className="mt-6 rounded-2xl bg-saffron-50 border border-saffron-200 px-4 py-3 text-sm text-ink-700">
            <p className="font-medium text-ink-900">
              ⏱ Pay within {expiresIn}
            </p>
            <p className="mt-1 caption text-xs text-ink-500">
              After this, your hold is released and you&apos;ll need to start over.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function DetailRow({
  label,
  value,
  copyable,
  mono,
}: {
  label: string
  value: string
  copyable?: boolean
  mono?: boolean
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-cream-200/70 last:border-b-0">
      <span className="text-eyebrow text-xs text-ink-500 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            'text-sm font-semibold text-ink-900 truncate',
            mono && 'font-mono tracking-wide',
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard?.writeText(value)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron-700 hover:text-saffron-600 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- Upload form (screenshot + UTR) -------------------------------- */

function UploadForm({
  instructions,
  rejected,
  onSubmitted,
}: {
  instructions: PaymentInstructions
  rejected: PaymentRecord | null
  onSubmitted: () => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [utr, setUtr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(f: File | null) {
    setError(null)
    setUploadedUrl(null)
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)

    // Auto-upload as soon as the user picks a file — one less click.
    if (!f) return
    setUploading(true)
    try {
      const img = await uploadPaymentScreenshot(f)
      setUploadedUrl(img.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload screenshot')
    } finally {
      setUploading(false)
    }
  }

  async function retryUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const img = await uploadPaymentScreenshot(file)
      setUploadedUrl(img.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload screenshot')
    } finally {
      setUploading(false)
    }
  }

  async function doSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!uploadedUrl) {
      setError('Please upload your payment screenshot first')
      return
    }
    if (utr.trim().length < 8) {
      setError('Enter the full UTR from your bank / UPI app')
      return
    }
    setSubmitting(true)
    try {
      await submitPayment({ utr: utr.trim(), screenshotUrl: uploadedUrl })
      await onSubmitted()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.reason === 'duplicate-utr') {
          setError('This UTR has already been used. Please re-check the reference number from your bank.')
        } else if (err.reason === 'submit-expired') {
          setError('Your payment window has expired. Please start a new subscription.')
        } else {
          setError(err.message)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Could not submit payment')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={doSubmit} className="space-y-6">
      <div>
        <p className="text-eyebrow text-ink-500">Step 02 — Upload proof</p>
        <h3 className="mt-2 text-display text-2xl tracking-tight text-ink-900">
          Submit your <span className="italic font-light text-saffron-600">payment proof.</span>
        </h3>
        <p className="mt-2 caption text-ink-500 max-w-xl">
          We need both the screenshot and the UTR / transaction ID so we can
          confirm the transfer with the bank. Reference number on the
          screenshot must match what you type below.
        </p>
      </div>

      {rejected && (
        <div className="rounded-2xl border border-spice-500/30 bg-spice-50 p-4 text-sm text-spice-700">
          <p className="font-semibold text-spice-700">Your previous payment was rejected</p>
          {rejected.rejectionReason && (
            <p className="mt-1 caption text-xs text-spice-700/80">
              Reason: {rejected.rejectionReason}
            </p>
          )}
          <p className="mt-1 caption text-xs text-spice-700/80">
            Please submit a fresh payment with a new UTR.
          </p>
        </div>
      )}

      {/* Screenshot picker */}
      <div>
        <p className="text-eyebrow text-ink-500 mb-2">Payment screenshot</p>
        <div className="grid sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-start">
          {/* Picker — square on mobile so it doesn't dominate the viewport. */}
          <label className="relative aspect-square sm:aspect-[3/4] rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 hover:border-saffron-300 hover:bg-saffron-50/40 active:scale-[0.99] transition-all cursor-pointer overflow-hidden grid place-items-center text-center">
            {preview ? (
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="p-4">
                <div className="mx-auto h-10 w-10 rounded-full bg-saffron-100 text-saffron-700 grid place-items-center text-lg">
                  ↑
                </div>
                <p className="mt-3 text-sm font-medium text-ink-900">Tap to upload</p>
                <p className="caption text-xs text-ink-500 mt-1">PNG / JPG · under 6 MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="space-y-2 text-sm">
            {file && (
              <div className="rounded-xl bg-cream-100 p-3">
                <p className="font-medium text-ink-900 truncate">{file.name}</p>
                <p className="caption text-xs text-ink-500">{Math.round(file.size / 1024)} KB</p>

                {uploading && (
                  <p className="mt-2 text-xs font-medium text-saffron-700 inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse-dot" />
                    Uploading…
                  </p>
                )}

                {!uploading && uploadedUrl && (
                  <p className="mt-2 text-xs font-semibold text-leaf-700 inline-flex items-center gap-2">
                    <span>✓</span>
                    Screenshot uploaded — visible only to admins
                  </p>
                )}

                {!uploading && !uploadedUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={retryUpload}
                  >
                    Retry upload
                  </Button>
                )}
              </div>
            )}
            <p className="caption text-xs text-ink-500">
              The screenshot should show the amount ({inr(instructions.amount)}),
              the UTR / transaction reference, and the recipient&apos;s UPI ID.
            </p>
          </div>
        </div>
      </div>

      {/* UTR */}
      <Input
        label="UTR / Transaction ID"
        placeholder="e.g. 412345678901"
        value={utr}
        onChange={(e) => setUtr(e.target.value.replace(/\s+/g, '').toUpperCase())}
        hint="12-digit number from your UPI app's transaction details. Each UTR can only be submitted once."
        maxLength={32}
      />

      {error && (
        <div className="rounded-2xl border border-spice-500/30 bg-spice-50 px-4 py-3 text-sm text-spice-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting || uploading || !uploadedUrl || utr.trim().length < 8}
        >
          {submitting ? 'Submitting…' : 'Submit for verification'}
        </Button>
        {!uploadedUrl && (
          <p className="caption text-xs text-ink-500">
            Pick a screenshot above first — it uploads automatically.
          </p>
        )}
        {uploadedUrl && utr.trim().length < 8 && (
          <p className="caption text-xs text-ink-500">
            Now enter the UTR from your UPI app (8+ characters).
          </p>
        )}
      </div>
    </form>
  )
}

/* ---------- Already-pending panel ----------------------------------------- */

function PendingVerification({ payment }: { payment: PaymentRecord }) {
  return (
    <Card className="p-5 sm:p-7 lg:p-9 ring-inset-warm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow text-saffron-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse-dot" />
              Pending verification
            </span>
          </p>
          <h3 className="mt-2 text-display text-2xl sm:text-3xl tracking-tight text-ink-900">
            We&apos;ve got your payment.
          </h3>
          <p className="mt-2 caption text-ink-500 max-w-md">
            Admin will verify your UTR against the bank within a few hours
            during business hours. We&apos;ll auto-refresh this page once
            it&apos;s approved.
          </p>
        </div>
        <Badge tone="saffron" dot>Awaiting review</Badge>
      </div>

      <div className="mt-7 hairline" />
      <div className="mt-2 grid sm:grid-cols-2 gap-x-8">
        <SummaryRow label="UTR submitted" value={payment.utr} mono />
        <SummaryRow label="Amount" value={`₹${payment.amount.toLocaleString('en-IN')}`} />
        <SummaryRow label="Reference" value={payment.orderRef} mono />
        <SummaryRow
          label="Submitted at"
          value={new Date(payment.submittedAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        />
      </div>
    </Card>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-cream-200/70 last:border-b-0">
      <span className="text-eyebrow text-xs text-ink-500">{label}</span>
      <span className={cn('text-sm font-medium text-ink-900 truncate', mono && 'font-mono tracking-wide')}>
        {value}
      </span>
    </div>
  )
}

/* ---------- Helpers ------------------------------------------------------- */

function formatRemaining(ms: number): string {
  const remaining = ms - Date.now()
  if (remaining <= 0) return 'now (expiring)'
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  if (hours >= 1) return `${hours}h ${Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))}m`
  const mins = Math.floor(remaining / (60 * 1000))
  return `${mins}m`
}
