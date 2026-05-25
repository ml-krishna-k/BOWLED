import { Container } from '@/components/ui/Container'

const ITEMS = [
  'FSSAI certified kitchens',
  '✦',
  'Cooked daily, never reheated',
  '✦',
  'Single-use sustainable packaging',
  '✦',
  'Nutritionist-approved menu',
  '✦',
  'Free same-day delivery',
  '✦',
  'Pause or skip anytime',
  '✦',
  'No frozen, no preservatives',
  '✦',
]

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-cream-200 bg-paper/40 py-8">
      <Container size="xl">
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max gap-12 animate-marquee whitespace-nowrap">
            {[...ITEMS, ...ITEMS].map((item, i) => (
              <span
                key={i}
                className="text-sm font-medium text-ink-700 tracking-wide"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
