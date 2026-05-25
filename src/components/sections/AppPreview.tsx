import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function AppPreview() {
  const navigate = useNavigate()
  return (
    <Section id="app" className="bg-cream-50 overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="On any device"
          title={<>Calm UI. <span className="text-saffron-600">Thumb-friendly.</span></>}
          description="Nothing to download — Bowled runs in your browser and works just as smoothly on your phone, tablet, or laptop. No popups, no chaos. Just three meals a day."
        />

        <div className="mt-16 grid lg:grid-cols-3 gap-6 items-center">
          <PhoneFrame variant="home" />
          <PhoneFrame variant="menu" elevated />
          <PhoneFrame variant="pause" />
        </div>

        <div className="mt-14 flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/auth/signup')}
            trailing={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            }
          >
            Open Bowled in your browser
          </Button>
          <p className="text-xs text-ink-500 max-w-md text-center">
            Tip: on your phone, tap your browser's share icon → <span className="font-medium text-ink-700">Add to Home Screen</span>. You'll get a one-tap launcher that looks and feels like a native app.
          </p>
        </div>
      </Container>
    </Section>
  )
}

function PhoneFrame({
  variant,
  elevated = false,
}: {
  variant: 'home' | 'menu' | 'pause'
  elevated?: boolean
}) {
  return (
    <div
      className={
        'mx-auto w-[260px] sm:w-[280px] aspect-[9/19] rounded-[44px] bg-ink-900 p-2 shadow-card ' +
        (elevated ? 'lg:-translate-y-6 lg:scale-[1.04]' : '')
      }
    >
      <div className="h-full w-full rounded-[36px] bg-cream-50 relative overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-ink-900" />
        <div className="pt-10 px-4 h-full">
          {variant === 'home' && <HomeScreen />}
          {variant === 'menu' && <MenuScreen />}
          {variant === 'pause' && <PauseScreen />}
        </div>
      </div>
    </div>
  )
}

function HomeScreen() {
  return (
    <>
      <p className="text-eyebrow">Today · Wed</p>
      <p className="mt-1 font-display text-xl text-ink-900">Hi Aarav 👋</p>
      <div className="mt-4 rounded-2xl bg-paper border border-cream-200 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-900">Next meal</p>
          <Badge tone="leaf">in 38 min</Badge>
        </div>
        <p className="mt-1 font-display text-lg text-ink-900">Chicken Curry Bowl</p>
        <p className="text-[11px] text-ink-500">Lunch · 1:00 PM</p>
        <div className="mt-3 h-1.5 rounded-full bg-cream-200">
          <div className="h-full w-[46%] rounded-full bg-saffron-500" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-paper border border-cream-200 p-3">
          <p className="text-ink-500">Day</p>
          <p className="font-semibold text-ink-900">14 of 30</p>
        </div>
        <div className="rounded-xl bg-paper border border-cream-200 p-3">
          <p className="text-ink-500">Meals left</p>
          <p className="font-semibold text-ink-900">48 of 90</p>
        </div>
      </div>
      <p className="mt-4 text-eyebrow">Tomorrow</p>
      <div className="mt-2 rounded-xl bg-cream-100 p-3 text-xs">
        <p className="font-medium text-ink-900">Aloo Paratha</p>
        <p className="text-ink-500">Breakfast · with white butter</p>
      </div>
    </>
  )
}

function MenuScreen() {
  return (
    <>
      <p className="text-eyebrow">This week</p>
      <p className="mt-1 font-display text-xl text-ink-900">Menu</p>
      <div className="mt-3 flex gap-1 overflow-hidden">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <span
            key={i}
            className={
              'shrink-0 grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold ' +
              (i === 2 ? 'bg-ink-900 text-cream-50' : 'bg-cream-100 text-ink-700')
            }
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[
          { t: 'Idli Sambar', s: 'Breakfast', loved: false },
          { t: 'Chicken Curry Bowl', s: 'Lunch', loved: true },
          { t: 'Khichdi & Kadhi', s: 'Dinner', loved: false },
        ].map((m) => (
          <div key={m.t} className="rounded-xl bg-paper border border-cream-200 p-3">
            <p className="text-[10px] text-ink-500">{m.s}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-900">{m.t}</p>
              {m.loved && <span className="text-saffron-500 text-xs">❤</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function PauseScreen() {
  return (
    <>
      <p className="text-eyebrow">Manage</p>
      <p className="mt-1 font-display text-xl text-ink-900">Pause meals</p>
      <p className="mt-1 text-[11px] text-ink-500">Going home? Exam week? No charge.</p>

      <div className="mt-4 rounded-2xl bg-paper border border-cream-200 p-3">
        <p className="text-[10px] text-ink-500">From</p>
        <p className="text-sm font-semibold text-ink-900">Mon, 22 May</p>
        <div className="my-3 h-px bg-cream-200" />
        <p className="text-[10px] text-ink-500">Until</p>
        <p className="text-sm font-semibold text-ink-900">Fri, 26 May</p>
      </div>

      <div className="mt-3 rounded-2xl bg-leaf-100 p-3 text-[11px] text-leaf-700">
        ✓ Plan extends by 5 days
      </div>

      <button className="mt-3 w-full rounded-full bg-saffron-500 text-cream-50 py-2 text-xs font-semibold">
        Confirm pause
      </button>
    </>
  )
}
