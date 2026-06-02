/**
 * Local-SEO landing-page template.
 *
 * Driven by SeoLanding entries in src/data/seo-landings.ts. Renders:
 *   - Top: Navbar (logo + nav, same as the marketing site)
 *   - Breadcrumb trail + chapter eyebrow
 *   - Single H1 with primary keyword (semantic + SEO)
 *   - Long-form body — multiple H2 sections, with optional H3 bullets
 *   - FAQ accordion (also emitted as FAQPage JSON-LD)
 *   - Internal links to peer landing pages (rank-flow + coverage)
 *   - CTA to /auth/signup
 *   - Footer
 *
 * Schema emitted per page: BreadcrumbList + FAQPage + Restaurant.
 */
import { Navigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Seo,
  breadcrumbSchema,
  faqPageSchema,
  restaurantSchema,
} from '@/components/seo/Seo'
import { findLanding } from '@/data/seo-landings'
import { cn } from '@/lib/cn'

export function LocalSeoLanding({ slug }: { slug: string }) {
  const landing = findLanding(slug)

  if (!landing) {
    return <Navigate to="/" replace />
  }

  const path = `/${landing.slug}`
  const schemas = [
    restaurantSchema(),
    faqPageSchema(landing.faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: landing.eyebrow, path },
    ]),
  ]

  return (
    <>
      <Seo
        title={landing.title}
        description={landing.metaDescription}
        keywords={landing.keywords}
        path={path}
        ogType="article"
        schema={schemas}
      />

      <Navbar />

      <main className="pt-24 sm:pt-32">
        {/* Breadcrumb trail (visible + accessible) */}
        <Container size="lg">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm">
            <ol className="flex items-center gap-2 text-ink-500">
              <li>
                <Link to="/" className="hover:text-saffron-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-ink-300">/</li>
              <li className="text-ink-900 font-medium" aria-current="page">
                {landing.eyebrow}
              </li>
            </ol>
          </nav>
        </Container>

        {/* Hero / H1 block */}
        <Section spacing="md" className="bg-cream-50 relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] sm:h-[620px]
                       bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,174,107,0.4)_0%,rgba(255,174,107,0)_60%)]"
          />
          <Container size="lg" className="relative">
            <p className="text-eyebrow text-saffron-600">{landing.eyebrow}</p>
            <h1 className="mt-3 text-display text-[2rem] sm:text-4xl lg:text-[3.5rem] tracking-[-0.025em] leading-[1.08] sm:leading-[1.04] text-ink-900 max-w-4xl">
              {landing.h1}
            </h1>
            <div className="mt-6 space-y-4 max-w-3xl">
              {landing.intro.map((p, i) => (
                <p key={i} className="text-[15px] sm:text-base lg:text-lg text-ink-500 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link to="/auth/signup">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  trailing={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 5 7 7-7 7" />
                    </svg>
                  }
                >
                  {landing.cta.buttonLabel}
                </Button>
              </Link>
              <Link to="/#plans">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See plans &amp; pricing
                </Button>
              </Link>
            </div>

            {/* Quick-trust strip */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
              <Badge tone="saffron" dot>4.8 rating</Badge>
              <Badge tone="leaf" dot>300+ daily eaters</Badge>
              <Badge tone="cream">Since 2006 · Sree Krishna Catering</Badge>
            </div>
          </Container>
        </Section>

        {/* Long-form body */}
        <Section spacing="md" className="bg-paper">
          <Container size="md">
            <article className="space-y-12 sm:space-y-16">
              {landing.sections.map((section, i) => (
                <section key={i} className="scroll-mt-24">
                  {section.eyebrow && (
                    <p className="text-eyebrow text-saffron-600">{section.eyebrow}</p>
                  )}
                  <h2 className="mt-2 text-display text-2xl sm:text-3xl lg:text-[2.25rem] tracking-tight leading-[1.1] text-ink-900">
                    {section.heading}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map((p, j) => (
                      <p key={j} className="text-[15px] sm:text-base text-ink-700 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                  {section.points && section.points.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2">
                      {section.points.map((pt, k) => (
                        <div
                          key={k}
                          className="rounded-2xl bg-cream-50 border border-cream-200/70 p-5 sm:p-6 ring-inset-warm"
                        >
                          <h3 className="font-display text-lg sm:text-xl text-ink-900 tracking-tight">
                            {pt.title}
                          </h3>
                          <p className="mt-2 text-[14px] sm:text-[15px] text-ink-500 leading-relaxed">
                            {pt.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </article>
          </Container>
        </Section>

        {/* FAQ */}
        <Section spacing="md" className="bg-mist">
          <Container size="md">
            <p className="text-eyebrow text-saffron-600 text-center">
              Frequently asked
            </p>
            <h2 className="mt-2 text-center text-display text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.1] text-ink-900">
              Common questions about <span className="italic font-light text-saffron-600">{landing.eyebrow.toLowerCase()}</span>
            </h2>

            <div className="mt-8 sm:mt-12 space-y-2.5 sm:space-y-3">
              {landing.faqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </Container>
        </Section>

        {/* Internal linking — peer landings */}
        <Section spacing="md" className="bg-cream-50">
          <Container size="lg">
            <p className="text-eyebrow text-saffron-600">More from Bowled</p>
            <h2 className="mt-2 text-display text-2xl sm:text-3xl tracking-tight text-ink-900">
              Related guides for Chennai eaters
            </h2>
            <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {landing.internalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group block rounded-2xl bg-paper border border-cream-200 p-5 hover:border-saffron-300 hover:shadow-card active:scale-[0.98] transition-all"
                >
                  <p className="font-display text-base sm:text-lg text-ink-900 tracking-tight group-hover:text-saffron-700">
                    {link.label} →
                  </p>
                  <p className="mt-2 text-[13px] sm:text-sm text-ink-500 leading-relaxed">
                    {link.blurb}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* Final CTA */}
        <Section spacing="md" className="bg-paper">
          <Container size="md">
            <Card className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-saffron-500 via-saffron-400 to-spice-500 px-6 py-12 sm:px-10 sm:py-16 shadow-glow">
              <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />
              <div className="relative max-w-2xl">
                <p className="text-eyebrow text-cream-50">Ready when you are</p>
                <h2 className="mt-3 text-display text-[1.75rem] sm:text-3xl lg:text-[2.75rem] text-cream-50 tracking-tight leading-[1.1]">
                  {landing.cta.headline}
                </h2>
                <p className="mt-4 text-cream-50/85 text-[15px] sm:text-base lg:text-lg leading-relaxed max-w-xl">
                  {landing.cta.sub}
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <Link to="/auth/signup">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-cream-50 text-ink-900 hover:bg-paper shadow-soft"
                    >
                      {landing.cta.buttonLabel}
                    </Button>
                  </Link>
                  <Link to="/auth/login">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-full sm:w-auto text-cream-50 hover:bg-cream-50/15"
                    >
                      I already have an account
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  )
}

/* ---------- Accordion FAQ item ----------------------------------------- */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={cn(
        'rounded-2xl border bg-paper transition-all duration-300',
        open
          ? 'border-saffron-300 shadow-card ring-1 ring-saffron-200/50'
          : 'border-cream-200 hover:border-cream-300',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base sm:text-lg lg:text-xl text-ink-900 tracking-tight leading-snug">
          {q}
        </span>
        <span
          className={cn(
            'grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full transition-all duration-300 shrink-0',
            open
              ? 'bg-saffron-500 text-cream-50 shadow-soft scale-105'
              : 'bg-cream-100 text-ink-700',
          )}
        >
          <svg viewBox="0 0 24 24" className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-45')} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div className={cn('grid transition-all duration-400 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <p className="px-4 sm:px-5 lg:px-6 pb-5 sm:pb-6 text-[14px] sm:text-base text-ink-500 leading-relaxed">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}
