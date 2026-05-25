import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAdmin } from '@/context/AdminContext'
import { PLANS } from '@/data/plans'
import { inr, maskPhone } from '@/lib/format'

export function AdminSubscriberDetail() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { subscribers, deliveries, pauseSubscriber, resumeSubscriber } = useAdmin()
  const sub = subscribers.find((s) => s.id === id)

  if (!sub) {
    return (
      <AppContainer>
        <p className="text-ink-500">Subscriber not found. <Link to="/admin/subscribers" className="text-saffron-700 underline">Back to list</Link></p>
      </AppContainer>
    )
  }

  const plan = PLANS.find((p) => p.id === sub.planId)!
  const todays = deliveries.filter((d) => d.subscriberId === sub.id)
  const todayServed = todays.filter((d) => d.status === 'served').length
  const pct = Math.round((sub.mealsServed / 90) * 100)

  return (
    <AppContainer>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5"
      >
        ← Back
      </button>

      <PageHeader
        className="mt-3"
        eyebrow={`+91 ${sub.phone}`}
        title={sub.name}
        description={`${sub.pgName}, ${sub.area} · Member for ${sub.daysIn} days`}
        action={
          sub.status === 'active' ? (
            <Button variant="outline" onClick={() => pauseSubscriber(sub.id)}>
              Pause subscription
            </Button>
          ) : sub.status === 'paused' ? (
            <Button variant="primary" onClick={() => resumeSubscriber(sub.id)}>
              Resume
            </Button>
          ) : (
            <Badge tone="cream">Churned</Badge>
          )
        }
      />

      {/* Plan + progress */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="ink">{plan.name} plan</Badge>
            <Badge tone={sub.status === 'active' ? 'leaf' : 'saffron'}>{sub.status}</Badge>
            <Badge tone="cream">Day {sub.daysIn} of 30</Badge>
          </div>

          <div className="mt-5">
            <p className="text-eyebrow text-ink-500">Cycle progress</p>
            <div className="mt-3 h-2.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-saffron-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-500">
              <span>{sub.mealsServed} served</span>
              <span>{90 - sub.mealsServed} remaining</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Today served" value={`${todayServed}/3`} />
            <Stat label="Avg rating" value={`★ ${sub.rating}`} />
            <Stat label="Group" value={sub.groupCode} mono />
          </div>
        </Card>

        <Card variant="soft" className="p-6 space-y-4">
          <div>
            <p className="text-eyebrow">Billing</p>
            <p className="mt-2 font-display text-3xl text-ink-900">{inr(plan.monthlyPrice)}</p>
            <p className="text-xs text-ink-500">per month, one-time payment</p>
          </div>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-ink-500">Per meal</span><span className="text-ink-900">{inr(plan.pricePerMeal)}</span></div>
            {plan.savingPerMonth > 0 && (
              <div className="flex justify-between"><span className="text-ink-500">Group savings</span><span className="text-leaf-700 font-medium">− {inr(plan.savingPerMonth)} / mo</span></div>
            )}
            <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span className="text-leaf-700">Free</span></div>
          </div>
        </Card>
      </div>

      {/* Contact + allergens */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg text-ink-900">Contact & delivery</h3>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <dt className="text-ink-500">Phone</dt>
            <dd className="col-span-2 text-ink-900">{maskPhone(sub.phone)}</dd>
            <dt className="text-ink-500">Address</dt>
            <dd className="col-span-2 text-ink-900">{sub.pgName}, {sub.area}, Chennai</dd>
            <dt className="text-ink-500">Joined</dt>
            <dd className="col-span-2 text-ink-900">{new Date(sub.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
          </dl>
        </Card>

        <Card variant="soft" className="p-6">
          <h3 className="font-display text-lg text-ink-900">Allergens</h3>
          {sub.allergens.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">None flagged.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {sub.allergens.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-spice-500/10 px-3 py-1 text-xs font-medium text-spice-700 border border-spice-500/30"
                >
                  ⚠ {a}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Today's meals */}
      <Card className="mt-4 p-6">
        <h3 className="font-display text-lg text-ink-900">Today's meals</h3>
        <ul className="mt-4 divide-y divide-cream-200">
          {todays.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-ink-500 capitalize">{d.slot} · {d.scheduledAt}</p>
                <p className="font-medium text-ink-900">{d.mealName}</p>
              </div>
              <Badge
                tone={d.status === 'served' ? 'leaf' : d.status === 'skipped' ? 'cream' : 'saffron'}
              >
                {d.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </AppContainer>
  )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-cream-100 px-3 py-3">
      <p className="text-eyebrow text-ink-500">{label}</p>
      <p className={'mt-1 ' + (mono ? 'font-mono text-sm text-ink-900' : 'font-display text-xl text-ink-900')}>
        {value}
      </p>
    </div>
  )
}
