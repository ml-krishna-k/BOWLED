import { Link } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAdmin } from '@/context/AdminContext'
import { inr } from '@/lib/format'
import { formatSkipDate, SLOT_LABEL } from '@/lib/skip'
import { cn } from '@/lib/cn'

export function AdminOverview() {
  const { kpis, deliveries, kitchens, subscribers, groups, menu, todayIdx, skipNotifications } = useAdmin()

  const slotsBreakdown = (['breakfast', 'lunch', 'dinner'] as const).map((slot) => {
    const items = deliveries.filter((d) => d.slot === slot)
    return {
      slot,
      label: slot[0].toUpperCase() + slot.slice(1),
      total: items.length,
      served: items.filter((d) => d.status === 'served').length,
      pending: items.filter((d) => d.status === 'pending').length,
      skipped: items.filter((d) => d.status === 'skipped').length,
      meal: menu[todayIdx].meals[slot].name,
    }
  })

  const topGroups = groups.slice(0, 4)
  const newestSubs = [...subscribers].sort((a, b) => b.joinedAt - a.joinedAt).slice(0, 5)

  return (
    <AppContainer>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        title="Overview"
        description="A real-time read on today's deliveries, this month's revenue, and who needs attention."
      />

      {/* KPI strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active subscribers" value={kpis.active.toString()} hint={`${kpis.paused} paused · ${kpis.totalSubscribers} total`} />
        <Kpi label="Meals to deliver today" value={kpis.mealsToday.toString()} hint={`${kpis.served} served · ${kpis.pending} pending`} tone="saffron" />
        <Kpi label="Revenue this month" value={inr(kpis.monthRevenue)} hint="Across active subscriptions" tone="leaf" />
        <Kpi label="Avg subscriber rating" value={`★ ${kpis.avgRating}`} hint="Rolling 30-day average" />
      </div>

      {/* Today's delivery breakdown */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-eyebrow">Today's run sheet</p>
            <h2 className="mt-1 font-display text-2xl text-ink-900">3 meal slots</h2>
          </div>
          <Link to="/admin/deliveries" className="text-sm font-medium text-saffron-700 hover:underline">
            Open run sheet →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {slotsBreakdown.map((s) => {
            const pct = s.total ? Math.round((s.served / s.total) * 100) : 0
            return (
              <div key={s.slot} className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-eyebrow text-ink-500">{s.label}</p>
                  <span className="text-xs text-ink-500">{pct}%</span>
                </div>
                <p className="mt-2 font-display text-xl text-ink-900">{s.meal}</p>
                <div className="mt-4 h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div className="h-full bg-saffron-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                  <span><b className="text-ink-900">{s.served}</b> served</span>
                  <span><b className="text-saffron-700">{s.pending}</b> pending</span>
                  <span><b className="text-spice-500">{s.skipped}</b> skipped</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Kitchen load + Top groups */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-900">Kitchen load</h2>
            <Link to="/admin/kitchens" className="text-sm font-medium text-saffron-700 hover:underline">
              See all →
            </Link>
          </div>
          <ul className="mt-5 space-y-4">
            {kitchens.map((k) => {
              const pct = Math.round((k.todaysLoad / k.capacityPerDay) * 100)
              const hot = pct > 85
              return (
                <li key={k.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 truncate">{k.area} · {k.chef}</p>
                      <p className="text-xs text-ink-500">{k.specialty}</p>
                    </div>
                    <Badge tone={hot ? 'saffron' : 'leaf'}>{pct}%</Badge>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className={cn('h-full', hot ? 'bg-saffron-500' : 'bg-leaf-500')}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {k.todaysLoad} / {k.capacityPerDay} meals today
                  </p>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-900">Largest groups</h2>
            <Link to="/admin/subscribers" className="text-sm font-medium text-saffron-700 hover:underline">
              Subscribers →
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {topGroups.map((g) => (
              <li key={g.code} className="flex items-center justify-between rounded-xl bg-cream-100 px-4 py-3">
                <div>
                  <p className="font-mono text-sm text-ink-900">{g.code}</p>
                  <p className="text-xs text-ink-500">{g.area} · {g.planId} plan</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-ink-900">{g.members} <span className="text-xs text-ink-500 font-sans">members</span></p>
                  <p className="text-xs text-leaf-700 font-semibold">Saving {inr(g.monthlySavings)} / mo</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Skip requests from subscribers — tells kitchen to not prepare meals */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-eyebrow">Skip requests</p>
            <h2 className="mt-1 font-display text-xl text-ink-900">
              Meals & days the kitchen should skip
            </h2>
          </div>
          {skipNotifications.length > 0 && (
            <Badge tone="saffron">{skipNotifications.length} this cycle</Badge>
          )}
        </div>

        {skipNotifications.length === 0 ? (
          <p className="mt-5 text-sm text-ink-500">
            No skip requests yet. When a monthly subscriber marks a meal or day to skip, it shows up here so kitchen knows not to prepare.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-cream-200">
            {skipNotifications.slice(0, 8).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold',
                      n.kind === 'day'
                        ? 'bg-saffron-100 text-saffron-700'
                        : 'bg-cream-100 text-ink-700',
                    )}
                  >
                    {n.kind === 'day' ? 'D' : 'M'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">
                      {n.subscriberName}
                      <span className="text-ink-500 font-normal"> · {n.groupCode}</span>
                    </p>
                    <p className="text-xs text-ink-500">
                      {formatSkipDate(n.date)}
                      {n.slot && <> · {SLOT_LABEL[n.slot]}</>}
                      {n.kind === 'day' && <> · all 3 meals</>}
                    </p>
                  </div>
                </div>
                <Badge tone={n.kind === 'day' ? 'saffron' : 'cream'}>
                  {n.kind === 'day' ? 'Day skip' : 'Meal skip'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Newest subscribers */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900">Newest subscribers</h2>
          <Link to="/admin/subscribers" className="text-sm font-medium text-saffron-700 hover:underline">
            View all →
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-cream-200">
          {newestSubs.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700 font-semibold">
                  {s.name[0]}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{s.name}</p>
                  <p className="text-xs text-ink-500">{s.area} · {s.pgName} · +91 {s.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone="cream">{s.planId}</Badge>
                <Badge tone={s.status === 'active' ? 'leaf' : s.status === 'paused' ? 'saffron' : 'cream'}>
                  {s.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </AppContainer>
  )
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'saffron' | 'leaf'
}) {
  return (
    <Card variant="soft" className="p-5">
      <p className="text-eyebrow text-ink-500">{label}</p>
      <p
        className={cn(
          'mt-2 font-display text-3xl',
          tone === 'saffron' && 'text-saffron-700',
          tone === 'leaf' && 'text-leaf-700',
          !tone && 'text-ink-900',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </Card>
  )
}
