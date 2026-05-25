import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TESTIMONIALS } from '@/data/testimonials'
import { cn } from '@/lib/cn'

// Predeclared so React doesn't re-derive on every render.
const AVATAR_TINTS = [
  'bg-saffron-100 text-saffron-700',
  'bg-leaf-100 text-leaf-700',
  'bg-spice-50 text-spice-700',
  'bg-cream-200 text-ink-700',
  'bg-saffron-200/60 text-saffron-700',
] as const

export function Testimonials() {
  return (
    <Section className="bg-paper">
      <Container>
        <SectionHeading
          eyebrow="Loved by students"
          title={<>What our <span className="text-saffron-600">300 daily eaters</span> say.</>}
          description="No paid reviews, no incentives. Pulled straight from our in-app feedback after their first 14 meals."
        />

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-ink-500">
          <Stat number="4.8" label="Avg. rating · 300+ subscribers" stars />
          <span className="hidden sm:inline h-6 w-px bg-cream-200" aria-hidden />
          <Stat number="93%" label="Re-subscribe after their first month" />
          <span className="hidden sm:inline h-6 w-px bg-cream-200" aria-hidden />
          <Stat number="48hr" label="From sign-up to first home-style meal" />
        </div>

        {/* Cards — all same height, even grid, no row-span tricks */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Card
              key={t.id}
              variant={i === 1 ? 'default' : 'soft'}
              className={cn(
                'group relative p-7 flex flex-col h-full transition-all duration-200',
                'hover:-translate-y-1 hover:shadow-card',
                i === 1 && 'border-saffron-200 ring-1 ring-saffron-200',
              )}
            >
              {i === 1 && (
                <div className="absolute -top-3 right-6">
                  <Badge tone="saffron">Most upvoted</Badge>
                </div>
              )}

              {/* Stars */}
              <div className="flex items-center gap-0.5 text-saffron-500" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg
                    key={s}
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.8L10 14.9 4.8 17.7l1-5.8L1.5 7.7l5.9-.9z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-4 text-[15px] sm:text-base leading-relaxed text-ink-700 flex-1">
                <span className="font-display text-saffron-300 text-3xl leading-none align-top mr-0.5">“</span>
                {t.quote}
                <span className="font-display text-saffron-300 text-3xl leading-none align-bottom ml-0.5">”</span>
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-cream-200/80">
                <div
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-full font-semibold text-sm shrink-0',
                    AVATAR_TINTS[i % AVATAR_TINTS.length],
                  )}
                  aria-hidden
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 truncate">{t.name}</p>
                  <p className="text-xs text-ink-500 truncate">{t.role} · {t.city}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Verification footnote */}
        <p className="mt-10 text-center text-xs text-ink-500">
          Reviews verified by phone number · Names shown with permission · No edits except for typos
        </p>
      </Container>
    </Section>
  )
}

function Stat({
  number,
  label,
  stars,
}: {
  number: string
  label: string
  stars?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-2xl sm:text-3xl text-ink-900">{number}</span>
      <div className="flex flex-col items-start">
        {stars && (
          <span className="text-saffron-500 text-xs tracking-tighter" aria-hidden>
            ★★★★★
          </span>
        )}
        <span className="text-xs text-ink-500">{label}</span>
      </div>
    </div>
  )
}
