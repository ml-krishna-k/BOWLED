import { useMemo, useState } from 'react'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useAdmin } from '@/context/AdminContext'
import { maskPhone } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { UserActivityKind } from '@/types'

type PhoneFilter = 'all' | 'has-phone' | 'no-phone'

export function AdminUsers() {
  const { users, activities } = useAdmin()
  const [q, setQ] = useState('')
  const [phone, setPhone] = useState<PhoneFilter>('all')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return users.filter((u) => {
      if (phone === 'has-phone' && !u.phone) return false
      if (phone === 'no-phone' && !!u.phone) return false
      if (!needle) return true
      return (
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.phone.includes(needle)
      )
    })
  }, [users, q, phone])

  const newToday = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return users.filter((u) => u.createdAt >= cutoff).length
  }, [users])

  const recent = activities.slice(0, 12)

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Users"
        title={`${users.length} registered`}
        description="Every account collected at sign-in — name, email and mobile. Newest first."
      />

      {/* Compact KPIs */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Total"     value={users.length} />
        <Stat label="New today" value={newToday} tone="saffron" />
        <Stat label="With phone" value={users.filter((u) => !!u.phone).length} tone="leaf" />
      </div>

      {/* Live activity feed — registers + logins + profile completions */}
      <Card className="mt-5 sm:mt-6 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-eyebrow">Live activity</p>
            <h2 className="mt-1 font-display text-lg sm:text-xl text-ink-900 tracking-tight">
              Recent sign-ins
            </h2>
          </div>
          {activities.length > 0 && (
            <Badge tone="saffron">{activities.length} events</Badge>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 caption text-ink-500">
            No activity yet. New registrations and logins will appear here within seconds.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-cream-200">
            {recent.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <ActivityIcon kind={a.kind} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">
                    {a.name}
                    <span className="text-ink-500 font-normal"> · {a.email}</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {a.phone ? maskPhone(a.phone) : 'No mobile yet'} · {relativeTime(a.at)}
                  </p>
                </div>
                <ActivityLabel kind={a.kind} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Filters */}
      <div className="mt-5 sm:mt-6 grid gap-3 sm:grid-cols-[2fr_auto]">
        <Input
          placeholder="Search by name, email or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leading={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          }
        />
        <select
          value={phone}
          onChange={(e) => setPhone(e.target.value as PhoneFilter)}
          className="h-12 rounded-2xl border border-cream-300 bg-paper px-4 text-sm text-ink-900"
        >
          <option value="all">All users</option>
          <option value="has-phone">With mobile</option>
          <option value="no-phone">Missing mobile</option>
        </select>
      </div>

      {/* Mobile cards / desktop table */}
      <Card className="mt-5 sm:mt-6 overflow-hidden">
        {/* Mobile list */}
        <ul className="lg:hidden divide-y divide-cream-200">
          {filtered.map((u) => (
            <li key={u.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} picture={u.picture} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink-900 truncate">{u.name}</p>
                    {u.isAdmin && <Badge tone="ink" className="shrink-0">Admin</Badge>}
                  </div>
                  <p className="text-xs text-ink-500 truncate">{u.email}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
                <dt className="text-ink-500">Mobile</dt>
                <dd className={cn('font-medium', u.phone ? 'text-ink-900' : 'text-spice-700')}>
                  {u.phone ? maskPhone(u.phone) : 'Not provided'}
                </dd>
                <dt className="text-ink-500">Joined</dt>
                <dd className="text-ink-900">{formatDate(u.createdAt)}</dd>
                {u.area && (
                  <>
                    <dt className="text-ink-500">Area</dt>
                    <dd className="text-ink-900">{u.area}</dd>
                  </>
                )}
              </dl>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-ink-500">No users match your filters.</li>
          )}
        </ul>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Mobile</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} picture={u.picture} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 truncate">{u.name}</p>
                        {u.area && <p className="text-xs text-ink-500">{u.area}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{u.email}</td>
                  <td className={cn('px-5 py-3', u.phone ? 'text-ink-900' : 'text-spice-700 italic')}>
                    {u.phone ? maskPhone(u.phone) : 'Not provided'}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    {u.isAdmin ? <Badge tone="ink">Admin</Badge> : <Badge tone="cream">User</Badge>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-500">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-ink-500">
        Showing {filtered.length} of {users.length}.
      </p>
    </AppContainer>
  )
}

/* ---------- Bits ------------------------------------------------------- */

function Avatar({ name, picture }: { name: string; picture: string }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover bg-cream-100"
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700 font-semibold">
      {(name[0] ?? '?').toUpperCase()}
    </span>
  )
}

function ActivityIcon({ kind }: { kind: UserActivityKind }) {
  const tone =
    kind === 'register' ? 'bg-leaf-100 text-leaf-700' :
    kind === 'profile_completed' ? 'bg-saffron-100 text-saffron-700' :
    'bg-cream-100 text-ink-700'
  const letter = kind === 'register' ? '✦' : kind === 'profile_completed' ? '☎' : '↻'
  return (
    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold', tone)}>
      {letter}
    </span>
  )
}

function ActivityLabel({ kind }: { kind: UserActivityKind }) {
  if (kind === 'register') return <Badge tone="leaf">New user</Badge>
  if (kind === 'profile_completed') return <Badge tone="saffron">Phone added</Badge>
  return <Badge tone="cream">Login</Badge>
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'saffron' | 'leaf'
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

function relativeTime(at: number): string {
  const diff = Date.now() - at
  if (diff < 60_000) return 'just now'
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return formatDate(at)
}

function formatDate(ms: number): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
