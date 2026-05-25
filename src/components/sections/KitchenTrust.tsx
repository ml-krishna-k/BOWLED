import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Card } from '@/components/ui/Card'

const PILLARS = [
  { stat: '20+', label: 'Years feeding Chennai · since 2006' },
  { stat: '300+', label: 'Students eating with us daily' },
  { stat: '< 2hrs', label: 'From cook to delivery, every meal' },
  { stat: '4', label: 'Chennai kitchens · all FSSAI Grade A' },
]

export function KitchenTrust() {
  return (
    <Section id="kitchen" className="bg-ink-900 text-cream-50">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7 space-y-6">
            <Eyebrow>A Sree Krishna Catering venture</Eyebrow>
            <h2 className="text-display text-3xl sm:text-4xl lg:text-5xl text-cream-50">
              20 years of feeding Chennai.{' '}
              <span className="text-saffron-300">Now built for students.</span>
            </h2>
            <p className="text-cream-50/70 text-lg leading-relaxed max-w-2xl">
              Bowled is the student-subscription venture from{' '}
              <span className="text-cream-50 font-medium">Sree Krishna Catering</span>,
              who&apos;ve been cooking for Chennai families, weddings and offices since 2006.
              We launched in May 2025 to bring that same home-style craft to PGs and
              hostels — three fresh meals, every day, no canteen shortcuts.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-cream-50/60">
              <span className="rounded-full bg-cream-50/10 px-3 py-1.5">Est. 2006</span>
              <span className="rounded-full bg-cream-50/10 px-3 py-1.5">Bowled launched · May 5, 2025</span>
              <span className="rounded-full bg-cream-50/10 px-3 py-1.5">300+ daily eaters</span>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {PILLARS.map((p) => (
              <Card
                key={p.label}
                variant="outline"
                className="p-5 border-cream-50/15 bg-cream-50/[0.04]"
              >
                <p className="font-display text-3xl sm:text-4xl text-cream-50">{p.stat}</p>
                <p className="mt-2 text-xs sm:text-sm text-cream-50/60">{p.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Kitchen list */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { city: 'Chennai · Adyar', chef: 'Saraswathi Akka', specialty: 'Tamil home cooking' },
            { city: 'Chennai · Velachery', chef: 'Padma Aunty', specialty: 'South Indian classics' },
            { city: 'Chennai · OMR (Thoraipakkam)', chef: 'Chef Anil', specialty: 'North-South fusion' },
            { city: 'Chennai · T. Nagar', chef: 'Meera Akka', specialty: 'Chettinad & coastal' },
          ].map((k) => (
            <div
              key={k.city}
              className="rounded-2xl bg-cream-50/[0.04] border border-cream-50/10 p-5 hover:bg-cream-50/[0.07] transition-colors"
            >
              <p className="text-xs text-cream-50/50">{k.city}</p>
              <p className="mt-2 font-display text-xl text-cream-50">{k.chef}</p>
              <p className="mt-2 text-sm text-cream-50/60">{k.specialty}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
