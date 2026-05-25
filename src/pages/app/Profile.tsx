import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContainer } from '@/components/app/AppContainer'
import { PageHeader } from '@/components/app/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { maskPhone } from '@/lib/format'

const COMMON_ALLERGENS = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Shellfish']

export function Profile() {
  const navigate = useNavigate()
  const { user, logout, update } = useAuth()
  const { reset } = useSubscription()

  const [name, setName] = useState(user?.name ?? '')
  const [line1, setLine1] = useState(user?.address.line1 ?? '')
  const [area, setArea] = useState(user?.address.area ?? '')
  const [saved, setSaved] = useState(false)

  if (!user) return null

  function save() {
    update({
      name,
      address: { line1, area, city: 'Chennai' },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  function handleResetSub() {
    reset()
    navigate('/app/subscription', { replace: true })
  }

  function toggleAllergen(a: string) {
    const set = new Set(user!.allergens)
    if (set.has(a)) set.delete(a)
    else set.add(a)
    update({ allergens: Array.from(set) })
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Profile"
        title="You & your preferences"
        description="Update your delivery details, allergens and notifications."
      />

      {/* Profile header */}
      <Card className="mt-8 p-6 sm:p-8 flex items-center gap-5">
        <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-saffron-500 text-cream-50 text-2xl font-display shadow-glow">
          {user.name[0]}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl text-ink-900 truncate">{user.name}</h2>
          <p className="text-sm text-ink-500">{maskPhone(user.phone)}</p>
          <p className="text-xs text-ink-400 mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </Card>

      {/* Personal */}
      <Card variant="soft" className="mt-6 p-6 space-y-5">
        <h3 className="font-display text-xl text-ink-900">Personal details</h3>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Address line"
          placeholder="Flat 3B, Padmavathy PG"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
        />
        <Input
          label="Area"
          placeholder="Velachery, Adyar, OMR…"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          hint="We only deliver inside Chennai right now."
        />
        <div className="flex items-center justify-between gap-3">
          {saved && <span className="text-sm text-leaf-700">✓ Saved</span>}
          <Button variant="primary" onClick={save} className="ml-auto">Save changes</Button>
        </div>
      </Card>

      {/* Allergens */}
      <Card className="mt-6 p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl text-ink-900">Allergens</h3>
          <p className="text-sm text-ink-500">
            Flagged on every meal card. We auto-swap the alternate veg/non-veg option on conflicting days.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGENS.map((a) => {
            const active = user.allergens.includes(a)
            return (
              <button
                key={a}
                onClick={() => toggleAllergen(a)}
                className={
                  'rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ' +
                  (active
                    ? 'border-spice-500 bg-spice-500/10 text-spice-700'
                    : 'border-cream-300 bg-paper text-ink-700 hover:border-cream-400')
                }
              >
                {active && '⚠ '}{a}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Preferences */}
      <Card variant="soft" className="mt-6 p-6 space-y-5">
        <h3 className="font-display text-xl text-ink-900">Notifications & reports</h3>
        <Switch
          label="Push notifications"
          description="Meal ready alerts, delivery updates, weekly menu drop."
          checked={user.notifications}
          onChange={(v) => update({ notifications: v })}
        />
        <Switch
          label="Parent peace-of-mind report"
          description="Weekly WhatsApp summary to your parents — meals served, nutrition trend, your favourite of the week."
          checked={user.parentReport}
          onChange={(v) => update({ parentReport: v })}
        />
      </Card>

      {/* Danger zone */}
      <Card variant="outline" className="mt-6 p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl text-ink-900">Account</h3>
          <p className="text-sm text-ink-500">Sign out of this device or reset your demo subscription.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleResetSub}>Reset subscription</Button>
          <Button variant="ghost" onClick={handleLogout}>
            <span className="text-spice-700">Log out</span>
          </Button>
          <Badge tone="cream">Demo build</Badge>
        </div>
      </Card>
    </AppContainer>
  )
}
