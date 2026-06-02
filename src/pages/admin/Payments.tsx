import { useCallback, useEffect, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { inr } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ApiError } from '@/lib/api'
import {
  approvePayment,
  listAdminPayments,
  rejectPayment,
  type AdminPaymentRow,
} from '@/lib/admin-payments'
import type { PaymentStatus } from '@/types'

type Filter = PaymentStatus | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending_verification', label: 'Pending' },
  { id: 'approved',             label: 'Approved' },
  { id: 'rejected',             label: 'Rejected' },
  { id: 'all',                  label: 'All' },
]

type Pending =
  | { kind: 'approve'; row: AdminPaymentRow }
  | { kind: 'reject';  row: AdminPaymentRow }
  | null

export function AdminPayments() {
  const [filter, setFilter] = useState<Filter>('pending_verification')
  const [rows, setRows] = useState<AdminPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<AdminPaymentRow | null>(null)
  const [pending, setPending] = useState<Pending>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await listAdminPayments(filter)
      setRows(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load payments')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void refresh() }, [refresh])

  async function confirmApprove(p: AdminPaymentRow) {
    setActingId(p.id)
    setError(null)
    try {
      await approvePayment(p.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setActingId(null)
      setPending(null)
    }
  }

  async function confirmReject(p: AdminPaymentRow, reason: string) {
    setActingId(p.id)
    setError(null)
    try {
      await rejectPayment(p.id, reason.trim() || undefined)
      await refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Rejection failed')
      }
    } finally {
      setActingId(null)
      setPending(null)
    }
  }

  const pendingCount = rows.filter((r) => r.status === 'pending_verification').length

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Verification queue"
        chapter="Payments"
        title={<>Pending <span className="italic font-light text-saffron-600">payments.</span></>}
        description="Verify each UTR against your bank statement, then approve or reject. Audit log captures every decision."
      />

      {/* Filter chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id
          const count = f.id === 'pending_verification' ? pendingCount : undefined
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 border inline-flex items-center gap-2',
                active
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700 shadow-soft'
                  : 'border-cream-200 bg-paper text-ink-500 hover:border-cream-300',
              )}
            >
              {f.label}
              {count !== undefined && count > 0 && (
                <Badge tone={active ? 'saffron' : 'cream'}>{count}</Badge>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-spice-500/30 bg-spice-50 px-4 py-3 text-sm text-spice-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-12 text-center caption text-ink-500">Loading…</p>
      ) : rows.length === 0 ? (
        <Card variant="soft" className="mt-10 p-10 text-center">
          <p className="text-eyebrow text-ink-500">Nothing to verify</p>
          <h3 className="mt-2 text-display text-2xl text-ink-900 tracking-tight">
            You&apos;re all caught up.
          </h3>
          <p className="mt-2 caption text-ink-500">
            New UPI submissions will appear here as subscribers upload them.
          </p>
        </Card>
      ) : (
        <div className="mt-10 space-y-4">
          {rows.map((p) => (
            <PaymentRow
              key={p.id}
              row={p}
              acting={actingId === p.id}
              onApprove={() => setPending({ kind: 'approve', row: p })}
              onReject={() => setPending({ kind: 'reject',  row: p })}
              onView={() => setViewing(p)}
            />
          ))}
        </div>
      )}

      {viewing && <ScreenshotModal row={viewing} onClose={() => setViewing(null)} />}
      {pending?.kind === 'approve' && (
        <ApproveModal
          row={pending.row}
          busy={actingId === pending.row.id}
          onClose={() => setPending(null)}
          onConfirm={() => confirmApprove(pending.row)}
        />
      )}
      {pending?.kind === 'reject' && (
        <RejectModal
          row={pending.row}
          busy={actingId === pending.row.id}
          onClose={() => setPending(null)}
          onConfirm={(reason) => confirmReject(pending.row, reason)}
        />
      )}
    </AppContainer>
  )
}

/* ---------- Row ---------------------------------------------------------- */

function PaymentRow({
  row,
  acting,
  onApprove,
  onReject,
  onView,
}: {
  row: AdminPaymentRow
  acting: boolean
  onApprove: () => void
  onReject: () => void
  onView: () => void
}) {
  const isPending = row.status === 'pending_verification'
  return (
    <Card className="p-4 sm:p-6 lift-card">
      {/* Mobile: thumbnail row on top, details below, actions full-width.
          lg+: 3-column grid (thumb | details | actions). */}
      <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] lg:grid-cols-[120px_1fr_auto] gap-4 sm:gap-5 lg:gap-6 items-start">
        {/* Screenshot thumbnail */}
        <button
          type="button"
          onClick={onView}
          className="block aspect-[3/4] w-full overflow-hidden rounded-xl bg-cream-100 ring-1 ring-cream-200 hover:ring-saffron-400 active:ring-saffron-400 transition-all"
          aria-label="View full screenshot"
        >
          <img
            src={row.screenshotUrl}
            alt="Payment screenshot"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </button>

        {/* Details */}
        <div className="min-w-0 space-y-2.5 sm:space-y-3">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <StatusBadge status={row.status} />
            <Badge tone="cream">{row.planId.toUpperCase()}</Badge>
            <Badge tone="paper" className="hidden sm:inline-flex">{row.billingCycleId.replace(/-/g, ' ')}</Badge>
          </div>

          <div>
            <p className="text-display text-base sm:text-lg lg:text-xl text-ink-900 tracking-tight leading-tight">
              {row.user?.name ?? '— unknown subscriber —'}
            </p>
            <p className="caption text-[12px] sm:text-sm text-ink-500 mt-0.5">
              +91 {row.user?.phone ?? '——'}
              {row.user?.area && <> · {row.user.area}</>}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm pt-1 sm:pt-2">
            <Field label="Amount" value={inr(row.amount)} />
            <Field label="UTR" value={row.utr} mono />
            <Field label="Reference" value={row.orderRef} mono />
            <Field
              label="Submitted"
              value={new Date(row.submittedAt).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            />
          </div>

          {row.rejectionReason && (
            <p className="caption text-spice-700">
              Reason: {row.rejectionReason}
            </p>
          )}
        </div>

        {/* Actions — span both cols on mobile so buttons fill the card width */}
        <div className="col-span-2 lg:col-span-1 flex lg:flex-col gap-2 lg:w-32 pt-1">
          {isPending ? (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={onApprove}
                disabled={acting}
                className="flex-1 lg:w-full"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onReject}
                disabled={acting}
                className="flex-1 lg:w-full"
              >
                Reject
              </Button>
            </>
          ) : (
            <p className="caption text-xs text-ink-400">
              {row.reviewedAt
                ? `${row.status === 'approved' ? 'Approved' : 'Rejected'} ${new Date(row.reviewedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
                : ''}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-eyebrow text-[10px] text-ink-500">{label}</p>
      <p className={cn('mt-1 text-ink-900 font-medium truncate', mono && 'font-mono tracking-wide')}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'pending_verification') return <Badge tone="saffron" dot>Pending</Badge>
  if (status === 'approved') return <Badge tone="leaf" dot>Approved</Badge>
  return <Badge tone="cream">Rejected</Badge>
}

/* ---------- Action modals ------------------------------------------------- */

/**
 * Reusable modal scaffold — locks body scroll, closes on backdrop click + Esc,
 * matches the editorial system (rounded-3xl, ring-inset-warm, hairlines).
 */
function ModalScaffold({
  children,
  onClose,
  maxWidth = 'max-w-md',
}: {
  children: React.ReactNode
  onClose: () => void
  maxWidth?: string
}) {
  // Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/55 backdrop-blur-sm p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full rounded-3xl bg-paper shadow-card ring-inset-warm overflow-hidden',
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string
  title: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="relative px-7 pt-7 pb-5">
      <p className="text-eyebrow text-saffron-600">{eyebrow}</p>
      <h2 className="mt-2 text-display text-2xl sm:text-[1.75rem] text-ink-900 tracking-tight leading-tight">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200 hover:text-ink-900 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}

function ApproveModal({
  row,
  busy,
  onClose,
  onConfirm,
}: {
  row: AdminPaymentRow
  busy: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ModalScaffold onClose={onClose}>
      <ModalHeader
        eyebrow="Confirm approval"
        title={<>Approve this <span className="italic font-light text-saffron-600">payment?</span></>}
        onClose={onClose}
      />
      <div className="px-7">
        <div className="hairline" />
        <div className="py-4 space-y-3 text-sm">
          <DetailLine label="Subscriber" value={row.user?.name ?? '—'} />
          <DetailLine label="Phone" value={row.user?.phone ? `+91 ${row.user.phone}` : '—'} />
          <DetailLine label="Amount" value={inr(row.amount)} bold />
          <DetailLine label="UTR" value={row.utr} mono />
        </div>
        <div className="hairline" />
        <p className="mt-4 caption text-ink-500">
          The subscription will go <strong className="not-italic text-ink-900">active</strong> for
          30 days. Confirm only after matching this UTR against your bank statement.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 px-7 py-5 bg-cream-50 border-t border-cream-200">
        <Button variant="ghost" size="md" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="secondary" size="md" onClick={onConfirm} disabled={busy}>
          {busy ? 'Approving…' : 'Approve & activate'}
        </Button>
      </div>
    </ModalScaffold>
  )
}

function RejectModal({
  row,
  busy,
  onClose,
  onConfirm,
}: {
  row: AdminPaymentRow
  busy: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 6

  return (
    <ModalScaffold onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader
        eyebrow="Reject payment"
        title={<>Send back to <span className="italic font-light text-spice-700">resubmit?</span></>}
        onClose={onClose}
      />
      <div className="px-7">
        <div className="hairline" />
        <div className="py-4 grid grid-cols-2 gap-3 text-sm">
          <DetailLine label="Subscriber" value={row.user?.name ?? '—'} />
          <DetailLine label="Amount" value={inr(row.amount)} bold />
          <DetailLine label="UTR" value={row.utr} mono />
          <DetailLine label="Reference" value={row.orderRef} mono />
        </div>
        <div className="hairline" />

        <label className="block mt-5">
          <span className="text-eyebrow text-ink-500">Rejection reason</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. UTR not found in our bank statement. Please double-check the reference number from your UPI app and resubmit."
            rows={4}
            maxLength={400}
            autoFocus
            className={cn(
              'mt-2 w-full rounded-2xl border bg-paper px-4 py-3 text-[15px] text-ink-900 leading-relaxed resize-none',
              'transition-colors focus:outline-none',
              tooShort
                ? 'border-spice-500/40 focus:border-spice-500'
                : 'border-cream-300 focus:border-saffron-400 focus:ring-2 focus:ring-saffron-200',
            )}
          />
          <div className="mt-1.5 flex items-center justify-between">
            <p className="caption text-xs text-ink-500">
              Shown to the subscriber so they know what to fix. Optional, but recommended.
            </p>
            <p className="caption text-xs text-ink-400 tabular-nums">
              {reason.length} / 400
            </p>
          </div>
        </label>

        <p className="mt-4 caption text-ink-500">
          Their subscription stays in <strong className="not-italic text-ink-900">pending_payment</strong> —
          they&apos;ll be prompted to submit a fresh payment with a new UTR.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 px-7 py-5 bg-cream-50 border-t border-cream-200">
        <Button variant="ghost" size="md" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          className="bg-spice-500 hover:bg-spice-700 text-cream-50"
          onClick={() => onConfirm(reason)}
          disabled={busy || tooShort}
        >
          {busy ? 'Rejecting…' : 'Reject payment'}
        </Button>
      </div>
    </ModalScaffold>
  )
}

function DetailLine({
  label,
  value,
  mono,
  bold,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 min-w-0">
      <span className="text-eyebrow text-xs text-ink-500 shrink-0">{label}</span>
      <span
        className={cn(
          'text-ink-900 truncate',
          mono && 'font-mono tracking-wide text-sm',
          bold ? 'font-semibold text-base' : 'font-medium text-sm',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ---------- Screenshot modal --------------------------------------------- */

function ScreenshotModal({ row, onClose }: { row: AdminPaymentRow; onClose: () => void }) {
  return (
    <ModalScaffold onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative bg-ink-900/5 grid place-items-center p-3">
        <img
          src={row.screenshotUrl}
          alt={`Screenshot for ${row.utr}`}
          className="max-h-[80vh] w-auto rounded-2xl"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-paper shadow-card text-ink-700 hover:text-ink-900"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="px-7 py-5 bg-cream-50 border-t border-cream-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <DetailLine label="Amount" value={inr(row.amount)} bold />
        <DetailLine label="UTR" value={row.utr} mono />
        <DetailLine label="Reference" value={row.orderRef} mono />
        <DetailLine
          label="Submitted"
          value={new Date(row.submittedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
        />
      </div>
    </ModalScaffold>
  )
}
