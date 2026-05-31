import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'

type Tile = {
  title: string
  desc: string
  accent: string
  image: string
  alt: string
  span?: 'tall' | 'wide' | 'normal'
  caption?: string
}

const TILES: Tile[] = [
  {
    title: 'Sourced from small farms',
    desc: 'Vegetables from FPOs within 80 km. Rice from a Karnataka co-op. Spices ground weekly so the aroma never dulls.',
    accent: 'from-leaf-100 to-cream-100',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Fresh vegetables on a wooden farm crate',
    span: 'tall',
    caption: 'Sourcing',
  },
  {
    title: 'Less oil, more flavour',
    desc: 'Cold-pressed oils, slow cooking, salt and ghee dialled to a home setting — not a restaurant one.',
    accent: 'from-saffron-100 to-cream-100',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Cold-pressed oil in a glass bottle next to spices',
    caption: 'Craft',
  },
  {
    title: 'Cooked in batches under 50',
    desc: 'No mass-canteen scale. Each kitchen handles small batches so quality stays consistent meal-to-meal.',
    accent: 'from-cream-100 to-saffron-100',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Chef stirring a small batch of curry in a kitchen',
    caption: 'Batches',
  },
  {
    title: 'Plated, never tossed',
    desc: 'Meals portioned into compartmentalised containers — your dal doesn\'t become roti soup by the time it reaches you.',
    accent: 'from-saffron-200 to-spice-500/30',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=85',
    alt: 'South Indian thali with separate compartments for each dish',
    span: 'wide',
    caption: 'Packaging',
  },
]

export function FoodShowcase() {
  return (
    <Section className="bg-mist relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-30" />

      <Container className="relative">
        <SectionHeading
          eyebrow="The food itself"
          title={<>Premium food shouldn&apos;t <span className="italic font-light text-saffron-600">cost premium.</span></>}
          description="We obsess over the boring bits — oil quality, batch size, packaging temperature — so the meal feels like effort, not assembly."
        />

        {/* Bento grid — varied tile sizes for editorial rhythm */}
        <div className="mt-16 grid gap-5 md:grid-cols-3 md:grid-rows-2 md:auto-rows-fr">
          {TILES.map((tile, i) => {
            const span =
              tile.span === 'tall'
                ? 'md:row-span-2'
                : tile.span === 'wide'
                  ? 'md:col-span-2'
                  : ''

            return (
              <Card
                key={tile.title}
                className={`group relative overflow-hidden p-0 lift-card ${span}`}
              >
                <div
                  className={`relative h-full min-h-[280px] bg-gradient-to-br ${tile.accent} img-reveal`}
                >
                  <img
                    src={tile.image}
                    alt={tile.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                  <div className="absolute inset-0 bg-grain opacity-20 mix-blend-multiply" aria-hidden />

                  {/* Cinematic vignette */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent"
                  />

                  {/* Editorial caption tag */}
                  {tile.caption && (
                    <span className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1 text-[11px] font-semibold text-ink-700 shadow-soft backdrop-blur-sm">
                      <span className="h-1 w-1 rounded-full bg-saffron-500" />
                      {tile.caption}
                    </span>
                  )}

                  {/* Copy overlaid for editorial feel */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10">
                    <h3 className="font-display text-xl sm:text-2xl text-cream-50 tracking-tight leading-tight">
                      {tile.title}
                    </h3>
                    <p className="mt-3 text-cream-50/85 text-[14px] sm:text-[15px] leading-relaxed max-w-md">
                      {tile.desc}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
