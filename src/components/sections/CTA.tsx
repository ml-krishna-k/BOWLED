import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

export function CTA() {
  const navigate = useNavigate()
  return (
    <Section className="bg-cream-50">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-saffron-500 via-saffron-400 to-spice-500 px-8 py-16 sm:px-14 sm:py-24 lg:py-28 shadow-glow">
          {/* Layered ambient depth */}
          <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cream-50/20 blur-3xl animate-breathe"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-spice-700/30 blur-3xl"
          />
          {/* Inner top highlight — premium gleam */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent"
          />

          <div className="relative max-w-3xl">
            <p className="text-eyebrow text-cream-50">Ready when you are</p>
            <h2 className="mt-4 text-display text-3xl sm:text-4xl lg:text-[3.5rem] text-cream-50 tracking-tight leading-[1.05]">
              One week. One plan. <span className="italic font-light">No commitment.</span>
            </h2>
            <p className="mt-5 text-cream-50/85 text-lg leading-relaxed max-w-xl">
              Start your trial today and we&apos;ll deliver your first meal tomorrow. If the food doesn&apos;t taste like home — we&apos;ll refund your full week, no questions.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-cream-50 text-ink-900 hover:bg-paper shadow-soft hover:shadow-card"
                onClick={() => navigate('/auth/signup')}
                trailing={
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                }
              >
                Start your subscription
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-cream-50 hover:bg-cream-50/15"
                onClick={() => navigate('/auth/login')}
              >
                I already have an account
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
