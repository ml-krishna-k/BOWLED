import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'

const STEPS = [
  {
    n: '01',
    title: 'Pick your plan',
    desc: 'Trial for a week or commit to a month — start with what fits your routine. Switch anytime.',
    icon: (
      <path d="M8 3v4M16 3v4M4 11h16M5 7h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    n: '02',
    title: 'Choose your meals',
    desc: 'Browse the weekly rotating menu, set your veg / non-veg preference, and flag allergens once.',
    icon: (
      <>
        <path d="M3 3h18l-2 9H5L3 3Z" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </>
    ),
  },
  {
    n: '03',
    title: 'We cook fresh',
    desc: 'Our partner kitchens start cooking 2 hours before delivery — never reheated, never frozen.',
    icon: (
      <>
        <path d="M4 19h16" />
        <path d="M5 19a7 7 0 1 1 14 0" />
        <path d="M12 5V3" />
      </>
    ),
  },
  {
    n: '04',
    title: 'Eat. Pause. Repeat.',
    desc: 'Show your QR pass at delivery, rate your meal, and pause/skip whenever life happens.',
    icon: (
      <>
        <path d="M6 4v16" />
        <path d="M14 4v16" />
        <path d="M10 4v16" />
        <path d="M18 4v16" />
      </>
    ),
  },
]

export function HowItWorks() {
  return (
    <Section id="how" className="bg-cream-50">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={<>Four small steps to <span className="text-saffron-600">stop worrying about food.</span></>}
          description="Designed for the messiness of student life — exam weeks, late nights, sudden trips home. The app bends around your schedule."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.n} className="group relative p-7 hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute right-6 top-6 font-display text-5xl text-cream-200 group-hover:text-saffron-200 transition-colors">
                {s.n}
              </div>

              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-saffron-100 text-saffron-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </div>

              <h3 className="mt-6 font-display text-xl text-ink-900">{s.title}</h3>
              <p className="mt-2 text-ink-500 text-[15px] leading-relaxed">{s.desc}</p>

              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 h-px w-6 bg-cream-300" />
              )}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
