import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36 pb-14 sm:pb-20 lg:pb-28">
      {/* Warm ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]
                   bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,174,107,0.45)_0%,rgba(255,174,107,0)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-[420px] w-[420px] rounded-full
                   bg-[radial-gradient(circle,rgba(155,189,135,0.35),transparent_70%)]"
      />
      <div className="absolute inset-0 -z-10 bg-grain opacity-60" aria-hidden />

      <Container size="xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-7">
            <div className="flex flex-wrap gap-2">
              <Badge tone="saffron">★ 4.8 average rating</Badge>
              <Badge tone="leaf">Now serving across Chennai</Badge>
              <Badge tone="cream">Backed by Sree Krishna Catering · since 2006</Badge>
            </div>

            <h1 className="text-display text-[2rem] sm:text-5xl lg:text-[4.2rem] leading-[1.05] sm:leading-[1.02]">
              Home-style daily meals,
              <br className="hidden sm:block" />
              <span className="text-shimmer"> for your PG life.</span>
            </h1>

            <p className="text-ink-500 text-base sm:text-lg leading-relaxed max-w-xl">
              Bowled is a meal subscription built for students in hostels,
              PGs and rented rooms — three balanced, home-cooked meals a day,
              a weekly rotating menu, and the kind of taste that reminds you of
              your mom&apos;s kitchen. Launched May 2025 by Sree Krishna Catering,
              who&apos;ve been feeding Chennai since 2006.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/auth/signup')}
                trailing={
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                }
              >
                Subscribe from ₹89 / meal
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => { document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                See this week's menu
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-4">
              <div className="flex -space-x-2.5">
                {['#fde2c4', '#f4c79e', '#e3b07d', '#caa37b'].map((c, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full ring-2 ring-cream-50 grid place-items-center text-xs font-semibold text-ink-700"
                    style={{ background: c }}
                  >
                    {['A','S','K','R'][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-ink-900">300+ students</span>
                {' '}eating with us every day across Chennai
              </p>
            </div>
          </div>

          {/* Hero visual: stacked plate cards — decorative; hidden on mobile
              because the absolute positioning collapses to overlapping junk
              when the column goes full-width. Shows from md upward. */}
          <div className="hidden md:block lg:col-span-5 relative h-[460px] sm:h-[540px]">
            {/* Today's lunch — main card */}
            <div className="absolute right-0 top-2 w-72 sm:w-80 rounded-3xl bg-paper shadow-card p-5 animate-float">
              <div className="flex items-center justify-between text-xs font-medium text-ink-500">
                <span>Today's lunch · Wed</span>
                <span className="flex items-center gap-1 text-leaf-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" /> Veg
                </span>
              </div>
              <div
                aria-hidden
                className="my-4 h-44 rounded-2xl bg-gradient-to-br from-saffron-200 via-saffron-100 to-cream-100 relative overflow-hidden"
              >
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-32 w-32 rounded-full bg-cream-50 shadow-inner grid place-items-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-saffron-400 to-spice-500" />
                  </div>
                </div>
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-saffron-700">
                  ❤ Most loved
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-snug text-ink-900">
                Dal Tadka Thali
              </h3>
              <p className="text-sm text-ink-500 mt-1">
                Jeera rice · phulka · poriyal · curd · gulab jamun
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                <span>720 kcal</span>
                <span className="font-semibold text-ink-900">★ 4.8</span>
              </div>
            </div>

            {/* Today's meals status card */}
            <div className="absolute left-0 sm:left-4 top-44 w-64 rounded-3xl bg-ink-900 text-cream-50 p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-eyebrow text-saffron-300/90">Today · Wed</p>
                <span className="rounded-full bg-leaf-500/20 text-leaf-300 px-2 py-0.5 text-[10px] font-semibold">
                  Day 14 / 30
                </span>
              </div>
              <p className="font-display text-2xl mt-2">3 fresh meals</p>

              <ul className="mt-4 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Breakfast</span>
                  <span className="inline-flex items-center gap-1 text-leaf-300 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-leaf-300" /> Served
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Lunch</span>
                  <span className="text-saffron-300 font-medium">in 38 min</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Dinner</span>
                  <span className="text-cream-50/50 font-medium">8:00 PM</span>
                </li>
              </ul>

              <div className="mt-4 h-1.5 rounded-full bg-cream-50/15 overflow-hidden">
                <div className="h-full w-[46%] bg-saffron-400" />
              </div>
              <p className="mt-2 text-[11px] text-cream-50/60">42 of 90 meals served</p>
            </div>

            {/* QR pass mini-card */}
            <div className="absolute bottom-6 right-4 w-56 rounded-3xl card-glass shadow-soft p-4">
              <div className="flex items-center justify-between">
                <p className="text-eyebrow text-saffron-700">QR meal pass</p>
                <span className="rounded-full bg-leaf-100 text-leaf-700 px-2 py-0.5 text-[10px] font-semibold">
                  Auto-debit
                </span>
              </div>
              <div className="mt-3 grid place-items-center">
                <div className="h-24 w-24 rounded-xl bg-paper p-2">
                  <div className="h-full w-full rounded-md bg-[conic-gradient(from_45deg,#1f1a12_25%,#fff_25%_50%,#1f1a12_50%_75%,#fff_75%)] [background-size:6px_6px]" />
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-ink-500">
                1 scan = 1 meal off your plan
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
