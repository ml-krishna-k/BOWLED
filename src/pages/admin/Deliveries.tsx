import { useEffect, useMemo, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { QrScannerView, type ScanResult } from '@/components/admin/QrScannerView'
import { useAdmin } from '@/context/AdminContext'
import type { MealSlot, DeliveryStatus } from '@/types'
import { cn } from '@/lib/cn'

type SlotFilter = 'all' | MealSlot

export function AdminDeliveries() {
  const { deliveries, kitchens, markDelivery, kpis, refresh } = useAdmin()
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

  const kitchenOf = (id: string) => kitchens.find((k) => k.id === id)?.area ?? '—'

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
    // Flip the matching delivery row to 'served' immediately so the admin
    // sees the update before the next API refresh poll completes.
    const match = deliveries.find(
      (d) => d.userId === result.subscriberId && d.slot === result.slot && d.status !== 'served',
    )
    if (match) markDelivery(match.id, 'served')
    setFlash(`✓ ${result.slot} marked served · ${result.mealsRemaining} meals left`)
    // Pull the fresh state from the server so totals + history stay in sync
    // for the Overview KPIs and any other admin screen.
    void refresh()
    setTimeout(() => setFlash(null), 4000)
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        title="Today's deliveries"
        description={`${kpis.served} served · ${kpis.pending} pending · ${deliveries.length} total. Filter by slot, area, or status.`}
      />

      {/* Top action bar — Scan QR button launches the real camera */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="caption text-ink-500">
          Point the camera at the subscriber's QR to mark a meal served.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => setScannerOpen(true)}
          className="shrink-0"
        >
          <span className="inline-flex items-center gap-2">
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

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Chip active={slot === 'all'} onClick={() => setSlot('all')}>All slots</Chip>
        <Chip active={slot === 'breakfast'} onClick={() => setSlot('breakfast')}>🌅 Breakfast</Chip>
        <Chip active={slot === 'lunch'} onClick={() => setSlot('lunch')}>🍛 Lunch</Chip>
        <Chip active={slot === 'dinner'} onClick={() => setSlot('dinner')}>🌙 Dinner</Chip>
        <div className="mx-2 h-6 w-px bg-cream-300" />
        <Chip active={status === 'pending'} onClick={() => setStatus('pending')}>Pending</Chip>
        <Chip active={status === 'served'} onClick={() => setStatus('served')}>Served</Chip>
        <Chip active={status === 'skipped'} onClick={() => setStatus('skipped')}>Skipped</Chip>
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>All status</Chip>
        <div className="mx-2 h-6 w-px bg-cream-300" />
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="h-9 rounded-full border border-cream-300 bg-paper px-3 text-xs text-ink-900"
        >
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <Card className="mt-6 overflow-hidden">
        <ul className="divide-y divide-cream-200">
          {filtered.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700 font-semibold">
                {d.subscriberName[0]}
              </div>
              <div className="min-w-[160px]">
                <p className="font-medium text-ink-900">{d.subscriberName}</p>
                <p className="text-xs text-ink-500">{d.pgName}, {d.area}</p>
              </div>
              <div className="min-w-[180px]">
                <p className="text-xs uppercase tracking-wider text-ink-500">{d.slot} · {d.scheduledAt}</p>
                <p className="font-medium text-ink-900">{d.mealName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={d.isVeg ? 'leaf' : 'saffron'}>{d.isVeg ? 'Veg' : 'Non-veg'}</Badge>
                <Badge tone="cream">Kitchen · {kitchenOf(d.kitchenId)}</Badge>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge tone={d.status === 'served' ? 'leaf' : d.status === 'skipped' ? 'cream' : 'saffron'}>
                  {d.status}
                </Badge>
                {d.status === 'pending' ? (
                  <Button size="sm" variant="ghost" onClick={() => markDelivery(d.id, 'served')}>
                    Mark served
                  </Button>
                ) : d.status === 'skipped' ? (
                  // Skipped rows are read-only — the customer chose to skip,
                  // so we don't show an Undo (admin shouldn't override the
                  // customer's opt-out from this list view).
                  <span className="text-xs text-ink-400">Skipped by customer</span>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => markDelivery(d.id, 'pending')}>
                    Undo
                  </Button>
                )}
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-ink-500">No deliveries match your filters.</li>
          )}
        </ul>
      </Card>

      {/* Scanner modal — only mounted while open so the camera releases on close */}
      {scannerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scan subscriber QR"
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/70 backdrop-blur-sm p-3 sm:p-6 animate-fade-up"
        >
          <div className="relative w-full max-w-4xl rounded-3xl bg-cream-50 p-4 sm:p-6 shadow-card max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
              <div>
                <p className="text-eyebrow text-saffron-600">Scan QR</p>
                <h2 className="mt-1 text-display text-xl sm:text-2xl tracking-tight text-ink-900">
                  Scan a customer's pass
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                aria-label="Close scanner"
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <QrScannerView
              onSuccess={handleScanSuccess}
              onClose={() => setScannerOpen(false)}
            />
          </div>
        </div>
      )}
    </AppContainer>
  )
}

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
        'rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors',
        active
          ? 'border-ink-900 bg-ink-900 text-cream-50'
          : 'border-cream-300 bg-paper text-ink-700 hover:border-cream-400',
      )}
    >
      {children}
    </button>
  )
}
