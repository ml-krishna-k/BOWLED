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
    <Section id="kitchen" className="bg-ink-900 text-cream-50 relative overflow-hidden">
      {/* Warm ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[520px] w-[520px] rounded-full
                   bg-[radial-gradient(circle,rgba(245,106,27,0.18),transparent_70%)] animate-breathe"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full
                   bg-[radial-gradient(circle,rgba(255,174,107,0.12),transparent_70%)]"
      />

      <Container className="relative">
        <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 items-end">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <Eyebrow>A Sree Krishna Catering venture</Eyebrow>
            <h2 className="text-display text-[2rem] sm:text-4xl lg:text-5xl text-cream-50 tracking-tight leading-[1.1]">
              20 years of feeding Chennai.{' '}
              <span className="italic font-light text-saffron-300">Now built for students.</span>
            </h2>
            <p className="text-cream-50/70 text-[15px] sm:text-base lg:text-lg leading-relaxed max-w-2xl">
              Bowled is the student-subscription venture from{' '}
              <span className="text-cream-50 font-medium">Sree Krishna Catering</span>,
              who&apos;ve been cooking for Chennai families, weddings and offices since 2006.
              We launched in May 2025 to bring that same home-style craft to PGs and
              hostels — three fresh meals, every day, no canteen shortcuts.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2 text-[11px] sm:text-xs text-cream-50/60">
              <span className="rounded-full bg-cream-50/10 px-2.5 sm:px-3 py-1 sm:py-1.5 ring-1 ring-cream-50/10">Est. 2006</span>
              <span className="rounded-full bg-cream-50/10 px-2.5 sm:px-3 py-1 sm:py-1.5 ring-1 ring-cream-50/10">Launched May 2025</span>
              <span className="rounded-full bg-cream-50/10 px-2.5 sm:px-3 py-1 sm:py-1.5 ring-1 ring-cream-50/10">300+ daily eaters</span>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            {PILLARS.map((p) => (
              <Card
                key={p.label}
                variant="outline"
                className="group p-4 sm:p-6 border-cream-50/15 bg-cream-50/[0.04] transition-all duration-400 hover:bg-cream-50/[0.08] hover:border-saffron-300/40 hover:-translate-y-1"
              >
                <p className="text-editorial text-2xl sm:text-3xl lg:text-4xl text-cream-50 transition-colors group-hover:text-saffron-200">{p.stat}</p>
                <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs lg:text-sm text-cream-50/60 leading-relaxed">{p.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="hairline mt-10 sm:mt-16 opacity-30" />

        {/* Kitchen list */}
        <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { city: 'Chennai · Adyar', chef: 'Saraswathi Akka', specialty: 'Tamil home cooking' },
            { city: 'Chennai · Velachery', chef: 'Padma Aunty', specialty: 'South Indian classics' },
            { city: 'Chennai · OMR (Thoraipakkam)', chef: 'Chef Anil', specialty: 'North-South fusion' },
            { city: 'Chennai · T. Nagar', chef: 'Meera Akka', specialty: 'Chettinad & coastal' },
          ].map((k) => (
            <div
              key={k.city}
              className="group rounded-2xl bg-cream-50/[0.04] border border-cream-50/10 p-4 sm:p-5 transition-all duration-400 hover:bg-cream-50/[0.08] hover:border-saffron-300/30 hover:-translate-y-1"
            >
              <p className="text-[11px] sm:text-xs text-cream-50/50 inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-saffron-400" />
                {k.city}
              </p>
              <p className="mt-2 sm:mt-3 font-display text-lg sm:text-xl text-cream-50 tracking-tight transition-colors group-hover:text-saffron-200">{k.chef}</p>
              <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-cream-50/60">{k.specialty}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
