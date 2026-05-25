import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useAdmin } from '@/context/AdminContext'
import type { SubscriberStatus, Plan } from '@/types'
import { cn } from '@/lib/cn'

type Filter = 'all' | SubscriberStatus
type PlanFilter = 'all' | Plan['id']

export function AdminSubscribers() {
  const { subscribers } = useAdmin()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Filter>('all')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return subscribers.filter((s) => {
      if (status !== 'all' && s.status !== status) return false
      if (planFilter !== 'all' && s.planId !== planFilter) return false
      if (!needle) return true
      return (
        s.name.toLowerCase().includes(needle) ||
        s.phone.includes(needle) ||
        s.area.toLowerCase().includes(needle) ||
        s.groupCode.toLowerCase().includes(needle)
      )
    })
  }, [subscribers, q, status, planFilter])

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Subscribers"
        title={`${subscribers.length} subscribers`}
        description="Search, filter, click into any subscriber to manage their plan."
      />

      {/* Filters */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[2fr_auto] items-end">
        <Input
          placeholder="Search by name, phone, area, group code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leading={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          }
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Filter)}
            className="h-12 rounded-2xl border border-cream-300 bg-paper px-4 text-sm text-ink-900"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
            className="h-12 rounded-2xl border border-cream-300 bg-paper px-4 text-sm text-ink-900"
          >
            <option value="all">All plans</option>
            <option value="solo">Solo</option>
            <option value="squad">Squad</option>
            <option value="floor">Floor</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3 font-semibold">Subscriber</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Area / PG</th>
                <th className="px-5 py-3 font-semibold">Group</th>
                <th className="px-5 py-3 font-semibold">Day</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700 font-semibold">
                        {s.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 truncate">{s.name}</p>
                        <p className="text-xs text-ink-500">+91 {s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize text-ink-700">{s.planId}</td>
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{s.area}</p>
                    <p className="text-xs text-ink-500">{s.pgName}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-700">{s.groupCode}</td>
                  <td className="px-5 py-3 text-ink-700">{s.daysIn} / 30</td>
                  <td className="px-5 py-3 text-ink-700">★ {s.rating}</td>
                  <td className="px-5 py-3">
                    <Badge tone={s.status === 'active' ? 'leaf' : s.status === 'paused' ? 'saffron' : 'cream'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/subscribers/${s.id}`}
                      className="text-sm font-medium text-saffron-700 hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-500">
                    No subscribers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className={cn('mt-4 text-xs text-ink-500')}>
        Showing {filtered.length} of {subscribers.length}.
      </p>
    </AppContainer>
  )
}
