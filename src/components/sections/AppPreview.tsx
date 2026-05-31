import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function AppPreview() {
  const navigate = useNavigate()
  return (
    <Section id="app" className="bg-cream-50 overflow-hidden relative">
      {/* Subtle ambient warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-20 -z-0 h-[420px]
                   bg-[radial-gradient(50%_50%_at_50%_0%,rgba(255,174,107,0.22)_0%,rgba(255,174,107,0)_70%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="On any device"
          title={<>Calm UI. <span className="italic font-light text-saffron-600">Thumb-friendly.</span></>}
          description="Nothing to download — Bowled runs in your browser and works just as smoothly on your phone, tablet, or laptop. No popups, no chaos. Just three meals a day."
        />

        <div className="mt-20 grid lg:grid-cols-3 gap-6 items-center perspective-scene">
          <PhoneFrame variant="home" rotation="-2deg" />
          <PhoneFrame variant="menu" elevated />
          <PhoneFrame variant="pause" rotation="2deg" />
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant="secondary"
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
          <p className="text-xs text-ink-500 max-w-md text-center leading-relaxed">
            Tip: on your phone, tap your browser&apos;s share icon → <span className="font-medium text-ink-700">Add to Home Screen</span>. You&apos;ll get a one-tap launcher that looks and feels like a native app.
          </p>
        </div>
      </Container>
    </Section>
  )
}

function PhoneFrame({
  variant,
  elevated = false,
  rotation,
}: {
  variant: 'home' | 'menu' | 'pause'
  elevated?: boolean
  rotation?: string
}) {
  return (
    <div
      className={
        'group mx-auto w-[260px] sm:w-[280px] aspect-[9/19] rounded-[44px] bg-ink-900 p-2 shadow-card transition-transform duration-700 ease-out ' +
        (elevated ? 'lg:-translate-y-8 lg:scale-[1.06] hover:lg:-translate-y-10' : 'hover:-translate-y-2')
      }
      style={rotation ? { transform: `rotate(${rotation})` } : undefined}
    >
      <div className="h-full w-full rounded-[36px] bg-cream-50 relative overflow-hidden">
        {/* Inner top highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-paper/60 to-transparent"
        />
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
      <p className="mt-1 font-display text-xl text-ink-900 tracking-tight">Hi Aarav 👋</p>
      <div className="mt-4 rounded-2xl bg-paper border border-cream-200 p-3 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-900">Next meal</p>
          <Badge tone="leaf" dot>in 38 min</Badge>
        </div>
        <p className="mt-1 font-display text-lg text-ink-900 tracking-tight">Chicken Curry Bowl</p>
        <p className="text-[11px] text-ink-500">Lunch · 1:00 PM</p>
        <div className="mt-3 h-1.5 rounded-full bg-cream-200">
          <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-saffron-400 to-saffron-500" />
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
      <div className="mt-2 rounded-xl bg-cream-100 p-3 text-xs border border-cream-200/60">
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
      <p className="mt-1 font-display text-xl text-ink-900 tracking-tight">Menu</p>
      <div className="mt-3 flex gap-1 overflow-hidden">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <span
            key={i}
            className={
              'shrink-0 grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold transition-colors ' +
              (i === 2 ? 'bg-ink-900 text-cream-50 scale-110' : 'bg-cream-100 text-ink-700')
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
          <div key={m.t} className="rounded-xl bg-paper border border-cream-200 p-3 shadow-soft">
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
      <p className="mt-1 font-display text-xl text-ink-900 tracking-tight">Pause meals</p>
      <p className="mt-1 text-[11px] text-ink-500">Going home? Exam week? No charge.</p>

      <div className="mt-4 rounded-2xl bg-paper border border-cream-200 p-3 shadow-soft">
        <p className="text-[10px] text-ink-500">From</p>
        <p className="text-sm font-semibold text-ink-900">Mon, 22 May</p>
        <div className="my-3 h-px bg-cream-200" />
        <p className="text-[10px] text-ink-500">Until</p>
        <p className="text-sm font-semibold text-ink-900">Fri, 26 May</p>
      </div>

      <div className="mt-3 rounded-2xl bg-leaf-100 p-3 text-[11px] text-leaf-700 ring-1 ring-leaf-300/30">
        ✓ Plan extends by 5 days
      </div>

      <button className="mt-3 w-full rounded-full bg-saffron-500 text-cream-50 py-2.5 text-xs font-semibold shadow-soft transition-all hover:bg-saffron-600 hover:shadow-glow">
        Confirm pause
      </button>
    </>
  )
}
