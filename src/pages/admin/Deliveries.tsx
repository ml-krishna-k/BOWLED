import { useMemo, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAdmin } from '@/context/AdminContext'
import type { MealSlot, DeliveryStatus } from '@/types'
import { cn } from '@/lib/cn'

type SlotFilter = 'all' | MealSlot

export function AdminDeliveries() {
  const { deliveries, kitchens, markDelivery, kpis } = useAdmin()
  const [slot, setSlot] = useState<SlotFilter>('all')
  const [status, setStatus] = useState<'all' | DeliveryStatus>('pending')
  const [area, setArea] = useState<string>('all')

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

  return (
    <AppContainer>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        title="Today's deliveries"
        description={`${kpis.served} served · ${kpis.pending} pending · ${deliveries.length} total. Filter by slot, area, or status.`}
      />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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
                  <>
                    <Button size="sm" variant="primary" onClick={() => markDelivery(d.id, 'served')}>
                      Scan QR
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => markDelivery(d.id, 'skipped')}>
                      Skip
                    </Button>
                  </>
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
