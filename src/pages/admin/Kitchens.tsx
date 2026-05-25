import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAdmin } from '@/context/AdminContext'
import { cn } from '@/lib/cn'

export function AdminKitchens() {
  const { kitchens, deliveries } = useAdmin()

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Partner kitchens"
        title="Four kitchens. One city."
        description="All FSSAI Grade A. Local home-cooks running their own kitchens, audited monthly."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {kitchens.map((k) => {
          const pct = Math.round((k.todaysLoad / k.capacityPerDay) * 100)
          const hot = pct > 85
          const todays = deliveries.filter((d) => d.kitchenId === k.id)
          const served = todays.filter((d) => d.status === 'served').length

          return (
            <Card key={k.id} className="overflow-hidden">
              <div
                className={cn(
                  'relative h-28',
                  hot
                    ? 'bg-gradient-to-r from-saffron-200 via-saffron-300 to-spice-500/40'
                    : 'bg-gradient-to-r from-leaf-100 via-cream-100 to-saffron-100',
                )}
                aria-hidden
              >
                <div className="absolute inset-0 bg-grain opacity-50" />
                <div className="absolute right-5 top-5">
                  <Badge tone={hot ? 'saffron' : 'leaf'}>{pct}% capacity</Badge>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-eyebrow text-ink-500">Chennai · {k.area}</p>
                    <h3 className="mt-2 font-display text-2xl text-ink-900">{k.chef}</h3>
                    <p className="text-sm text-ink-500">{k.specialty}</p>
                  </div>
                  <Badge tone="cream">FSSAI {k.fssaiGrade}</Badge>
                </div>

                <div className="mt-5 h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={cn('h-full', hot ? 'bg-saffron-500' : 'bg-leaf-500')}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <Mini label="Capacity" value={`${k.capacityPerDay}`} />
                  <Mini label="Today's load" value={`${k.todaysLoad}`} />
                  <Mini label="Rating" value={`★ ${k.rating}`} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <Mini label="Slots assigned" value={`${todays.length}`} tone="ink" />
                  <Mini label="Served so far" value={`${served}`} tone="leaf" />
                  <Mini label="Pending" value={`${todays.filter((d) => d.status === 'pending').length}`} tone="saffron" />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4">
                  <div>
                    <p className="text-xs text-ink-500">Chef on call</p>
                    <p className="font-medium text-ink-900">+91 {k.chefPhone}</p>
                  </div>
                  <a
                    href={`tel:+91${k.chefPhone}`}
                    className="rounded-full bg-cream-100 hover:bg-cream-200 transition-colors text-sm font-medium text-ink-900 px-4 py-2"
                  >
                    Call
                  </a>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </AppContainer>
  )
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'ink' | 'leaf' | 'saffron'
}) {
  return (
    <div className="rounded-xl bg-cream-100 px-2 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-ink-500">{label}</p>
      <p
        className={
          'mt-0.5 font-display text-lg ' +
          (tone === 'leaf' ? 'text-leaf-700' : tone === 'saffron' ? 'text-saffron-700' : 'text-ink-900')
        }
      >
        {value}
      </p>
    </div>
  )
}
