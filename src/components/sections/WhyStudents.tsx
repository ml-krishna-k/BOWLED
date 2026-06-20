import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'

const REASONS = [
  {
    title: 'Pause for exam weeks',
    desc: 'Going home for Diwali? Crunching for finals? Pause your plan in one tap — meals don\'t vanish.',
    icon: '⏸',
  },
  {
    title: 'Cheaper with friends',
    desc: 'Bring 5 roommates → ₹75/meal, save ₹1,260 each. Bring 10 from your floor → ₹69/meal, save ₹1,800 each. Real group pricing, applied automatically.',
    icon: '★',
  },
  {
    title: 'Allergen aware',
    desc: 'Flag your allergens once and every meal card shows it. Auto-swap for the alternate that day.',
    icon: '⚠',
  },
  {
    title: 'Built for hostel routines',
    desc: 'Hot delivery slots that match mess timings. Late-class? Push your meal by 60 minutes.',
    icon: '⏱',
  },
  {
    title: 'Scan-and-go QR pass',
    desc: 'Show your in-app QR at the door. The delivery person scans it once — one meal comes off your plan, automatically. No signing, no marking attendance.',
    icon: '▦',
  },
  {
    title: 'Eat, rate, get heard',
    desc: 'Every rating goes straight to the chef. If your week\'s favourite drops below 4 stars, we change it.',
    icon: '☆',
  },
]

export function WhyStudents() {
  return (
    <Section id="why" className="bg-paper relative overflow-hidden">
      <Container className="relative">
        <SectionHeading
          eyebrow="Why students love it"
          title={<>The little things that <span className="italic font-light text-saffron-600">make it feel like home.</span></>}
          description="Most tiffin services were built for offices. We started by asking 200 students what they actually wanted from a meal plan — these are their answers."
        />

        <div className="mt-10 sm:mt-14 lg:mt-16 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <Card
              key={r.title}
              variant="soft"
              className="group relative p-5 sm:p-6 lg:p-7 lift-card hover:bg-paper overflow-hidden"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-saffron-200/0 blur-2xl transition-colors duration-500 group-hover:bg-saffron-200/40"
              />

              <div className="relative grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-saffron-500 text-cream-50 font-display text-xl sm:text-2xl shadow-soft transition-transform duration-400 group-hover:scale-110 group-hover:rotate-3">
                {r.icon}
              </div>
              <h3 className="relative mt-4 sm:mt-6 font-display text-lg sm:text-xl text-ink-900 tracking-tight">{r.title}</h3>
              <p className="relative mt-2 text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">{r.desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
