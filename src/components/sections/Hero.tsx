import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden pt-20 sm:pt-28 lg:pt-40 pb-12 sm:pb-20 lg:pb-32">
      {/* Layered ambient warmth — shorter on mobile so the glow doesn't dominate
          the first-fold of a 360-wide phone. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] sm:h-[620px] lg:h-[820px]
                   bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,174,107,0.45)_0%,rgba(255,174,107,0)_60%)] sm:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,174,107,0.5)_0%,rgba(255,174,107,0)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-[320px] w-[320px] sm:h-[460px] sm:w-[460px] rounded-full
                   bg-[radial-gradient(circle,rgba(155,189,135,0.25),transparent_70%)] sm:bg-[radial-gradient(circle,rgba(155,189,135,0.32),transparent_70%)] animate-breathe"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 -z-10 h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] rounded-full
                   bg-[radial-gradient(circle,rgba(245,106,27,0.15),transparent_70%)] sm:bg-[radial-gradient(circle,rgba(245,106,27,0.18),transparent_70%)] animate-breathe"
        style={{ animationDelay: '3s' }}
      />
      <div className="absolute inset-0 -z-10 bg-grain opacity-40 sm:opacity-50" aria-hidden />

      <Container size="xl">
        <div className="grid lg:grid-cols-12 lg:gap-14 items-center">
          {/* Editorial copy column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 lg:space-y-8">
            {/* Badge cluster — on phones the third badge is hidden because three
                badges + cramped width creates a messy three-line wrap. */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 animate-fade-up">
              <Badge tone="saffron" dot>4.8 rating</Badge>
              <Badge tone="leaf" dot>Now in Chennai</Badge>
              <Badge tone="cream" className="hidden sm:inline-flex">Since 2006 · Sree Krishna Catering</Badge>
            </div>

            {/* Display headline — mobile-first scale. 2rem on phones reads
                comfortably on a 360-px viewport without horizontal scroll. */}
            <h1 className="text-display text-[2rem] sm:text-[3rem] lg:text-[4.5rem] leading-[1.08] sm:leading-[1.02] tracking-[-0.02em] sm:tracking-tight animate-fade-up delay-100">
              Home-style daily meals,
              <br className="hidden sm:block" />
              <span className="italic font-light text-shimmer">
                {' '}for your PG life.
              </span>
            </h1>

            <p className="text-ink-500 text-[15px] sm:text-base lg:text-lg leading-relaxed max-w-xl animate-fade-up delay-200">
              Bowled is a meal subscription built for students in hostels,
              PGs and rented rooms — three home-cooked meals a day,
              a weekly rotating menu, and the kind of taste that reminds you of
              your mom&apos;s kitchen.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 pt-1 animate-fade-up delay-300">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/auth/login')}
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
                See this week&apos;s menu
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-2 animate-fade-up delay-400">
              <div className="flex -space-x-2 sm:-space-x-2.5">
                {['#fde2c4', '#f4c79e', '#e3b07d', '#caa37b'].map((c, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-cream-50 grid place-items-center text-xs font-semibold text-ink-700"
                    style={{ background: c }}
                  >
                    {['A','S','K','R'][i]}
                  </div>
                ))}
              </div>
              <p className="text-[13px] sm:text-sm text-ink-500 leading-snug">
                <span className="font-semibold text-ink-900">300+ students</span>
                {' '}eating with us every day
              </p>
            </div>

            {/* Mobile-only food photo — phones don't get the desktop bento. */}
            <div className="md:hidden relative mt-4 overflow-hidden rounded-2xl shadow-card img-reveal img-vignette animate-fade-up delay-500">
              <img
                src="/hero-spread.webp"
                alt="A spread of home-style dishes — dal, rice, greens and sides"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={900}
                className="aspect-[4/3] w-full object-cover animate-reveal"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
                <p className="text-cream-50 font-display text-base sm:text-lg leading-tight">
                  Today&apos;s lunch · Dal Tadka Thali
                </p>
                <p className="text-cream-50/85 text-[11px] sm:text-xs mt-1">
                  Jeera rice · phulka · poriyal · curd · gulab jamun · ★ 4.8
                </p>
              </div>
            </div>
          </div>

          {/* Desktop bento — hidden on mobile (mobile gets the dedicated photo above) */}
          <div className="hidden md:block lg:col-span-5 relative h-[500px] sm:h-[580px] perspective-scene">
            {/* Main hero plate card — featured */}
            <div
              className="absolute right-0 top-0 w-72 sm:w-[22rem] rounded-3xl bg-paper shadow-card p-5 animate-float ring-inset-warm tilt-hover"
              style={{ transform: 'rotate(1deg)' }}
            >
              <div className="flex items-center justify-between text-xs font-medium text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse-dot" />
                  Today&apos;s lunch · Wed
                </span>
                <span className="flex items-center gap-1 text-leaf-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" /> Veg
                </span>
              </div>
              <div className="my-4 h-48 rounded-2xl bg-cream-100 relative overflow-hidden img-reveal img-vignette">
                <img
                  src="/hero-spread.webp"
                  alt="A spread of home-style dishes — dal, rice, greens and sides"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1200}
                  height={900}
                  className="absolute inset-0 h-full w-full object-cover animate-reveal"
                />
                <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-semibold text-saffron-700 shadow-soft backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-saffron-500" />
                  Most loved
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-snug text-ink-900 tracking-tight">
                Dal Tadka Thali
              </h3>
              <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                Jeera rice · phulka · poriyal · curd · gulab jamun
              </p>
              <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-ink-500">
                <span>720 kcal · 28g protein</span>
                <span className="font-semibold text-ink-900 inline-flex items-center gap-1">
                  <span className="text-saffron-500">★</span> 4.8
                </span>
              </div>
            </div>

            {/* Today's meals — dark editorial card */}
            <div
              className="absolute left-0 sm:left-2 top-52 w-64 rounded-3xl bg-ink-900 text-cream-50 p-5 shadow-card tilt-hover overflow-hidden"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-saffron-500/20 blur-2xl"
              />
              <div className="relative flex items-center justify-between">
                <p className="text-eyebrow text-saffron-300/90">Today · Wed</p>
                <span className="rounded-full bg-leaf-500/20 text-leaf-300 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-leaf-500/30">
                  Day 14 / 30
                </span>
              </div>
              <p className="relative font-display text-2xl mt-2 tracking-tight">3 fresh meals</p>

              <ul className="relative mt-4 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Breakfast</span>
                  <span className="inline-flex items-center gap-1.5 text-leaf-300 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-leaf-300" /> Served
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Lunch</span>
                  <span className="text-saffron-300 font-medium inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-saffron-300 animate-pulse-dot" />
                    in 38 min
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-cream-50/70">Dinner</span>
                  <span className="text-cream-50/50 font-medium">8:00 PM</span>
                </li>
              </ul>

              <div className="relative mt-4 h-1.5 rounded-full bg-cream-50/15 overflow-hidden">
                <div className="h-full w-[46%] bg-gradient-to-r from-saffron-400 to-saffron-300" />
              </div>
              <p className="relative mt-2 text-[11px] text-cream-50/60">42 of 90 meals served</p>
            </div>

            {/* QR pass mini-card */}
            <div
              className="absolute bottom-2 right-2 w-56 rounded-3xl card-glass shadow-soft p-4 animate-float-slow tilt-hover"
              style={{ transform: 'rotate(2deg)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-eyebrow text-saffron-700">QR meal pass</p>
                <span className="rounded-full bg-leaf-100 text-leaf-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-leaf-300/40">
                  Auto-debit
                </span>
              </div>
              <div className="mt-3 grid place-items-center">
                <div className="h-24 w-24 rounded-xl bg-paper p-2 shadow-soft">
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
