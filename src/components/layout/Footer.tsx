import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { BRAND } from '@/lib/constants'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Weekly menu', href: '#menu' },
      { label: 'Subscription plans', href: '#plans' },
      { label: 'On any device', href: '#app' },
    ],
  },
  {
    title: 'Eat with us',
    // Internal links to SEO landing pages — drives rank flow and gives
    // crawlers a clear path from every page to every other page.
    links: [
      { label: 'Hostel food in Chennai', href: '/hostel-food-chennai' },
      { label: 'PG food in Chennai', href: '/pg-food-chennai' },
      { label: 'Tiffin service Chennai', href: '/tiffin-service-chennai' },
      { label: 'Meal subscription Chennai', href: '/meal-subscription-chennai' },
    ],
  },
  {
    title: 'For you',
    links: [
      { label: 'Student meals Chennai', href: '/student-meals-chennai' },
      { label: 'Office lunch Chennai', href: '/office-lunch-chennai' },
      { label: 'Home-cooked food Chennai', href: '/home-cooked-food-chennai' },
      { label: 'Healthy meals Chennai', href: '/healthy-meals-chennai' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our chefs', href: '#kitchen' },
      { label: 'Best meals in Chennai', href: '/best-meals-chennai' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
]

// Tel-link target: strip everything except digits and the leading +, otherwise
// some Android dialers won't auto-fill the country code from a pretty number.
const PHONE_TEL = BRAND.phone.replace(/[^\d+]/g, '')

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cream-200 bg-cream-100/40">
      <div className="absolute inset-0 bg-grain opacity-50" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 sm:-top-32 left-1/2 -translate-x-1/2 h-48 sm:h-64 w-[90%] sm:w-[80%] rounded-full
                   bg-[radial-gradient(circle,rgba(255,174,107,0.18),transparent_70%)]"
      />

      <Container className="relative">
        {/* Contact rail — first thing visible when the user scrolls to the
            footer. Mobile-first layout:
              • brand block at top (smaller logo + condensed tagline)
              • two contact tiles stacked full-width below
            sm+ keeps the contact tiles side-by-side; lg moves the brand to
            the left of the contact tiles. */}
        <div className="pt-10 sm:pt-14 lg:pt-20">
          <div className="rounded-2xl sm:rounded-3xl border border-cream-200 bg-paper/80 backdrop-blur-sm shadow-soft p-4 sm:p-6 lg:p-8">
            <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.2fr_2fr] lg:items-center">
              {/* Brand */}
              <div className="space-y-2.5 sm:space-y-3 min-w-0">
                <Logo size="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                <p className="text-ink-700 text-sm sm:text-[15px] lg:text-base leading-relaxed max-w-md">
                  {BRAND.tagline}. Cooked fresh every morning in our partner
                  kitchens, delivered warm to your door in {BRAND.city}.
                </p>
              </div>

              {/* Contact actions — stack on mobile, side-by-side from sm. */}
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                <ContactLink
                  href={`mailto:${BRAND.email}`}
                  eyebrow="Email"
                  label={BRAND.email}
                  description="We reply within 4 hours"
                  icon={<MailIcon />}
                />
                <ContactLink
                  href={`tel:${PHONE_TEL}`}
                  eyebrow="Call us"
                  label={BRAND.phone}
                  description="Mon–Sun · 9 AM to 9 PM"
                  icon={<PhoneIcon />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Link grid — mobile lays out as 2 columns so 4 link sections form a
            tidy 2×2 (≈ half the vertical space of the old 1-col stack). The
            lineage column spans both columns at the top so the link grid
            below it is symmetrical. md goes to 3-col, lg unfolds to the
            full 5-col desktop layout. */}
        <div className="grid gap-x-6 gap-y-8 sm:gap-y-10 py-8 sm:py-12 lg:py-16 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Lineage column — full row on small/tablet, single column on lg */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-2.5">
            <p className="text-eyebrow text-ink-900">Our story</p>
            <p className="text-sm text-ink-500 leading-relaxed max-w-sm">
              A venture by <span className="font-medium text-ink-700">{BRAND.parentCompany}</span> — feeding {BRAND.city} since {BRAND.parentSince}.
            </p>
            <p className="text-xs text-ink-400 leading-relaxed">
              {new Date().getFullYear() - BRAND.parentSince}+ years of home-style cooking, now bowl by bowl.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="min-w-0">
              <h4 className="text-eyebrow mb-2.5 sm:mb-3 lg:mb-4 text-ink-900">{col.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {col.links.map((l) => {
                  const isPath = l.href.startsWith('/')
                  const className =
                    'group inline-flex items-center gap-1 text-[14px] sm:text-[15px] text-ink-500 transition-colors py-1 hover:text-saffron-700 active:text-saffron-700 focus-visible:outline-none focus-visible:text-saffron-700'
                  const inner = (
                    <>
                      <span className="truncate">{l.label}</span>
                      <span aria-hidden className="hidden sm:inline opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                    </>
                  )
                  return (
                    <li key={l.label} className="min-w-0">
                      {isPath ? (
                        <Link to={l.href} className={className}>{inner}</Link>
                      ) : (
                        <a href={l.href} className={className}>{inner}</a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal footer bar */}
        <div className="flex flex-col-reverse gap-3 sm:gap-4 border-t border-cream-200 py-5 sm:py-6 md:flex-row md:items-center md:justify-between text-[11px] sm:text-xs lg:text-sm text-ink-500">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} {BRAND.name} · A {BRAND.parentCompany} venture · {BRAND.city}.
          </p>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2">
            <a href="#" className="hover:text-ink-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-ink-900 transition-colors">FSSAI Lic. 12345678901234</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

/* ---------- Bits ------------------------------------------------------- */

interface ContactLinkProps {
  href: string
  eyebrow: string
  label: string
  description: string
  icon: React.ReactNode
}

/**
 * Tappable contact tile. Mobile sizing: ≥56px tall (above the 44px iOS
 * touch target floor), icon shrinks slightly, label uses `break-all` so a
 * long email never blows the card off the side of a narrow phone (it would
 * wrap mid-word rather than overflow).
 */
function ContactLink({ href, eyebrow, label, description, icon }: ContactLinkProps) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-cream-200 bg-cream-50/60 px-3.5 py-3 sm:px-5 sm:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-saffron-300 hover:bg-paper hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.99] min-h-[60px] sm:min-h-[68px]"
    >
      <span
        aria-hidden
        className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full bg-saffron-500 text-cream-50 shadow-soft transition-transform duration-300 group-hover:scale-105"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">
          {eyebrow}
        </span>
        <span className="mt-0.5 block font-display text-[15px] sm:text-[17px] text-ink-900 tracking-tight leading-tight break-all sm:break-normal sm:truncate group-hover:text-saffron-700 transition-colors">
          {label}
        </span>
        <span className="block text-[11px] sm:text-xs text-ink-500 truncate mt-0.5">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className="hidden sm:inline shrink-0 text-ink-400 group-hover:text-saffron-700 group-hover:translate-x-0.5 transition-all duration-300"
      >
        →
      </span>
    </a>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17.5v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.1z" />
    </svg>
  )
}
