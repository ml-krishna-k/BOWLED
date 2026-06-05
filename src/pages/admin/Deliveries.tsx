import { useEffect, useMemo, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { QrScannerView, type ScanResult } from '@/components/admin/QrScannerView'
import { useAdmin } from '@/context/AdminContext'
import type { MealSlot, DeliveryStatus, Delivery } from '@/types'
import { cn } from '@/lib/cn'

type SlotFilter = 'all' | MealSlot

export function AdminDeliveries() {
  const { deliveries, markDelivery, kpis, refresh } = useAdmin()
  const [slot, setSlot] = useState<SlotFilter>('all')
  const [status, setStatus] = useState<'all' | DeliveryStatus>('pending')
  const [area, setArea] = useState<string>('all')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const areas = useMemo(
    () => Array.from(new Set(deliveries.map((d) => d.area))).sort(),
    [deliveries],
  )

  const filtered = useMemo(
    () =>
      deliveries.filter((d) => {
        if (slot !== 'all' && d.slot !== slot) return false
        if (status !== 'all' && d.status !== status) return false
        if (area !== 'all' && d.area !== area) return false
        return true
      }),
    [deliveries, slot, status, area],
  )

  // Lock background scroll while the scanner modal is open. Without this the
  // page scrolls under the modal on mobile when the user pinches/swipes.
  useEffect(() => {
    if (!scannerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [scannerOpen])

  function handleScanSuccess(result: ScanResult) {
    const match = deliveries.find(
      (d) => d.userId === result.subscriberId && d.slot === result.slot && d.status !== 'served',
    )
    if (match) markDelivery(match.id, 'served')
    setFlash(`✓ ${result.slot} marked served · ${result.mealsRemaining} meals left`)
    void refresh()
    setTimeout(() => setFlash(null), 4000)
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        title="Today's deliveries"
        description="Tap Scan QR to mark a meal served, or use the per-row action."
      />

      {/* KPI strip — three compact stat tiles. On mobile the three sit side-by-
          side (since phone numerics are short). */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Served"  value={kpis.served}            tone="leaf" />
        <Stat label="Pending" value={kpis.pending}           tone="saffron" />
        <Stat label="Total"   value={deliveries.length}      tone="cream" />
      </div>

      {/* Top action bar — full-width Scan QR on mobile, inline on desktop. */}
      <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="caption text-ink-500 text-[13px] sm:text-sm">
          Point the camera at the subscriber's QR to mark a meal served.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => setScannerOpen(true)}
          className="w-full sm:w-auto sm:shrink-0"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Scan QR
          </span>
        </Button>
      </div>

      {flash && (
        <div
          role="status"
          className="mt-4 rounded-2xl bg-leaf-100 border border-leaf-300 px-4 py-3 text-sm text-leaf-700"
        >
          {flash}
        </div>
      )}

      {/* Filters
          Mobile: horizontally-scrollable chip rows so they never wrap into a
          jumble. Each chip is touch-sized. The area select drops to its own
          row so it isn't cramped against the chips.
          Desktop: wraps inline like before. */}
      <div className="mt-5 sm:mt-6 space-y-2.5">
        {/* Slot row */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
          <div className="flex items-center gap-2 sm:flex-wrap min-w-min">
            <FilterLabel>Slot</FilterLabel>
            <Chip active={slot === 'all'}       onClick={() => setSlot('all')}>All</Chip>
            <Chip active={slot === 'breakfast'} onClick={() => setSlot('breakfast')}>🌅 Breakfast</Chip>
            <Chip active={slot === 'lunch'}     onClick={() => setSlot('lunch')}>🍛 Lunch</Chip>
            <Chip active={slot === 'dinner'}    onClick={() => setSlot('dinner')}>🌙 Dinner</Chip>
          </div>
        </div>

        {/* Status row */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
          <div className="flex items-center gap-2 sm:flex-wrap min-w-min">
            <FilterLabel>Status</FilterLabel>
            <Chip active={status === 'pending'} onClick={() => setStatus('pending')}>Pending</Chip>
            <Chip active={status === 'served'}  onClick={() => setStatus('served')}>Served</Chip>
            <Chip active={status === 'skipped'} onClick={() => setStatus('skipped')}>Skipped</Chip>
            <Chip active={status === 'all'}     onClick={() => setStatus('all')}>All</Chip>
          </div>
        </div>

        {/* Area row */}
        <div className="flex items-center gap-2">
          <FilterLabel>Area</FilterLabel>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-9 flex-1 sm:flex-initial sm:max-w-[200px] rounded-full border border-cream-300 bg-paper px-3 text-xs text-ink-900"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <Card className="mt-5 sm:mt-6 overflow-hidden">
        <ul className="divide-y divide-cream-200">
          {filtered.map((d) => (
            <DeliveryRow
              key={d.id}
              d={d}
              onMarkServed={() => markDelivery(d.id, 'served')}
              onUndo={() => markDelivery(d.id, 'pending')}
            />
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-ink-500">No deliveries match your filters.</li>
          )}
        </ul>
      </Card>

      {/* Scanner modal — fullscreen on mobile, sized card on desktop */}
      {scannerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scan subscriber QR"
          className="fixed inset-0 z-50 bg-ink-900/80 backdrop-blur-sm sm:grid sm:place-items-center sm:p-6 animate-fade-up"
        >
          <div className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl bg-cream-50 sm:shadow-card flex flex-col sm:max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-cream-200 sm:border-b-0">
              <div className="min-w-0">
                <p className="text-eyebrow text-saffron-600">Scan QR</p>
                <h2 className="mt-0.5 sm:mt-1 text-display text-base sm:text-2xl tracking-tight text-ink-900 truncate">
                  Scan a customer's pass
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                aria-label="Close scanner"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200 active:scale-95 transition"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <QrScannerView
                onSuccess={handleScanSuccess}
                onClose={() => setScannerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </AppContainer>
  )
}

/* ---------- Row component ---------------------------------------------- */

interface DeliveryRowProps {
  d: Delivery
  onMarkServed: () => void
  onUndo: () => void
}

function DeliveryRow({ d, onMarkServed, onUndo }: DeliveryRowProps) {
  const statusTone =
    d.status === 'served' ? 'leaf' : d.status === 'skipped' ? 'cream' : 'saffron'

  return (
    <li className="px-4 sm:px-5 py-4">
      {/* Mobile-first stacked layout. sm+ keeps the same structure but the
          eye stays on density — the meal block sits inline with name on
          desktop via flex-wrap. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap">
        {/* Header: avatar + name (+ status pill on mobile) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700 font-semibold">
            {d.subscriberName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink-900 truncate">{d.subscriberName}</p>
            <p className="text-xs text-ink-500 truncate">{d.pgName ? `${d.pgName}, ` : ''}{d.area}</p>
          </div>
          {/* Status badge — mobile only, right side of header row */}
          <Badge tone={statusTone} className="sm:hidden capitalize shrink-0">
            {d.status}
          </Badge>
        </div>

        {/* Meal block */}
        <div className="min-w-0 sm:min-w-[180px]">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-ink-500">
            {d.slot} · {d.scheduledAt}
          </p>
          <p className="mt-0.5 font-medium text-ink-900 truncate">{d.mealName}</p>
        </div>

        {/* Tags */}
        <Badge tone={d.isVeg ? 'leaf' : 'saffron'} className="self-start sm:self-auto">
          {d.isVeg ? 'Veg' : 'Non-veg'}
        </Badge>

        {/* Action — status badge inline (desktop only) + action button */}
        <div className="flex items-center justify-between gap-2 sm:ml-auto">
          <Badge tone={statusTone} className="hidden sm:inline-flex capitalize">
            {d.status}
          </Badge>
          {d.status === 'pending' ? (
            <Button size="sm" variant="ghost" onClick={onMarkServed} className="w-full sm:w-auto">
              Mark served
            </Button>
          ) : d.status === 'skipped' ? (
            <span className="text-xs text-ink-400 italic">Skipped by customer</span>
          ) : (
            <Button size="sm" variant="ghost" onClick={onUndo} className="w-full sm:w-auto">
              Undo
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

/* ---------- Bits ------------------------------------------------------- */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors',
        active
          ? 'border-ink-900 bg-ink-900 text-cream-50'
          : 'border-cream-300 bg-paper text-ink-700 hover:border-cream-400',
      )}
    >
      {children}
    </button>
  )
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500 pr-1">
      {children}
    </span>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'leaf' | 'saffron' | 'cream'
}) {
  const ringClass =
    tone === 'leaf' ? 'border-leaf-300/60 bg-leaf-50' :
    tone === 'saffron' ? 'border-saffron-300/60 bg-saffron-50' :
    'border-cream-300 bg-paper'

  return (
    <div className={cn('rounded-2xl border px-3 py-3 sm:px-4 sm:py-4', ringClass)}>
      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">{label}</p>
      <p className="mt-1 text-display text-2xl sm:text-3xl tracking-tight text-ink-900 tabular-nums">
        {value}
      </p>
    </div>
  )
}
