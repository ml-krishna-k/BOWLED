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
    <Section id="how" className="bg-cream-50 relative overflow-hidden">
      {/* Soft ambient mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh opacity-40" />

      <Container className="relative">
        <SectionHeading
          eyebrow="How it works"
          title={<>Four small steps to <span className="italic font-light text-saffron-600">stop worrying about food.</span></>}
          description="Designed for the messiness of student life — exam weeks, late nights, sudden trips home. The app bends around your schedule."
        />

        <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card
              key={s.n}
              className="group relative p-5 sm:p-6 lg:p-7 lift-card overflow-hidden"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-saffron-50/0 via-transparent to-saffron-50/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-saffron-50/40 group-hover:to-cream-100/40"
              />

              <div className="relative">
                {/* Numeral scales down on mobile so it doesn't crowd the title */}
                <div className="absolute right-0 -top-1 font-display text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] leading-none text-cream-200 transition-all duration-500 group-hover:text-saffron-200 group-hover:scale-110">
                  {s.n}
                </div>

                <div className="relative grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-saffron-100 text-saffron-700 transition-all duration-300 group-hover:bg-saffron-500 group-hover:text-cream-50 group-hover:shadow-soft">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {s.icon}
                  </svg>
                </div>

                <h3 className="mt-4 sm:mt-6 font-display text-lg sm:text-xl text-ink-900 tracking-tight">{s.title}</h3>
                <p className="mt-2 text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">{s.desc}</p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 h-px w-6 bg-gradient-to-r from-cream-300 to-transparent" />
              )}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
