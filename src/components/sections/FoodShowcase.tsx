import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'

const TILES = [
  {
    title: 'Sourced from small farms',
    desc: 'Vegetables from FPOs within 80 km. Rice from a Karnataka co-op. Spices ground weekly.',
    accent: 'from-leaf-100 to-cream-100',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=720&q=80',
    alt: 'Fresh vegetables on a wooden farm crate',
  },
  {
    title: 'Less oil, more flavour',
    desc: 'We use cold-pressed oils and slow-cooking. Salt and oil are dialled to a home setting, not a restaurant one.',
    accent: 'from-saffron-100 to-cream-100',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=720&q=80',
    alt: 'Cold-pressed oil in a glass bottle next to spices',
  },
  {
    title: 'Cooked in batches under 50',
    desc: 'No mass-canteen scale. Each kitchen handles small batches so quality stays consistent meal-to-meal.',
    accent: 'from-cream-100 to-saffron-100',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=720&q=80',
    alt: 'Chef stirring a small batch of curry in a kitchen',
  },
  {
    title: 'Plated, never tossed',
    desc: 'Meals are portioned into compartmentalised containers — your dal doesn\'t become roti soup by the time it reaches you.',
    accent: 'from-saffron-200 to-spice-500/30',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=720&q=80',
    alt: 'Indian thali with separate compartments for each dish',
  },
]

export function FoodShowcase() {
  return (
    <Section className="bg-mist">
      <Container>
        <SectionHeading
          eyebrow="The food itself"
          title={<>Premium food shouldn't <span className="text-saffron-600">cost premium.</span></>}
          description="We obsess over the boring bits — oil quality, batch size, packaging temperature — so the meal feels like effort, not assembly."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {TILES.map((tile) => (
            <Card key={tile.title} className="overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className={`md:col-span-2 relative min-h-[200px] bg-gradient-to-br ${tile.accent}`}>
                  <img
                    src={tile.image}
                    alt={tile.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-grain opacity-30 mix-blend-multiply" aria-hidden />
                </div>
                <div className="md:col-span-3 p-7 sm:p-8">
                  <h3 className="font-display text-xl sm:text-2xl text-ink-900">{tile.title}</h3>
                  <p className="mt-3 text-ink-500 leading-relaxed">{tile.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
