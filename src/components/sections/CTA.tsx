import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

export function CTA() {
  const navigate = useNavigate()
  return (
    <Section className="bg-cream-50">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-saffron-500 via-saffron-400 to-spice-500 px-8 py-16 sm:px-14 sm:py-20 lg:py-24 shadow-glow">
          <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cream-50/15 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-spice-700/30 blur-3xl"
          />

          <div className="relative max-w-3xl">
            <p className="text-eyebrow text-cream-50">Ready when you are</p>
            <h2 className="mt-4 text-display text-3xl sm:text-4xl lg:text-5xl text-cream-50">
              One week. One plan. No commitment.
            </h2>
            <p className="mt-5 text-cream-50/80 text-lg leading-relaxed max-w-xl">
              Start your trial today and we'll deliver your first meal tomorrow. If the food doesn't taste like home — we'll refund your full week, no questions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-cream-50 text-ink-900 hover:bg-cream-100 shadow-soft"
                onClick={() => navigate('/auth/signup')}
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
