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
    title: 'Kitchen',
    links: [
      { label: 'Our chefs', href: '#kitchen' },
      { label: 'Hygiene standards', href: '#kitchen' },
      { label: 'Nutrition philosophy', href: '#kitchen' },
      { label: 'Partner kitchens', href: '#kitchen' },
    ],
  },
  {
    title: 'For you',
    links: [
      { label: 'Student plans', href: '#plans' },
      { label: 'Parent peace-of-mind', href: '#parents' },
      { label: 'Referral rewards', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cream-200 bg-cream-100/40">
      <div className="absolute inset-0 bg-grain opacity-50" aria-hidden />
      {/* Soft top ambient warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[80%] rounded-full
                   bg-[radial-gradient(circle,rgba(255,174,107,0.18),transparent_70%)]"
      />

      <Container className="relative">
        <div className="grid gap-8 sm:gap-10 py-12 sm:py-16 lg:py-20 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <Logo size="h-12 w-12 sm:h-14 sm:w-14" />
            <p className="text-ink-500 max-w-xs leading-relaxed">
              {BRAND.tagline}. Cooked fresh every morning in our partner kitchens, delivered warm to your door.
            </p>
            <p className="text-xs text-ink-500 max-w-xs leading-relaxed">
              A venture by <span className="font-medium text-ink-700">{BRAND.parentCompany}</span>{' '}
              — feeding Chennai since {BRAND.parentSince}.
            </p>
            <div className="space-y-1 text-sm text-ink-500">
              <p>{BRAND.email}</p>
              <p>{BRAND.phone}</p>
            </div>
            <div className="flex gap-2 pt-2">
              {['Instagram', 'X', 'LinkedIn', 'YouTube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full bg-paper border border-cream-200 text-ink-700 transition-all duration-300 hover:border-saffron-400 hover:text-saffron-700 hover:-translate-y-0.5 hover:shadow-soft"
                  aria-label={s}
                >
                  <span className="text-xs font-semibold">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-eyebrow mb-3 sm:mb-4 text-ink-900">{col.title}</h4>
              <ul className="space-y-3 sm:space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-[15px] text-ink-500 transition-colors py-1 hover:text-saffron-700 active:text-saffron-700"
                    >
                      <span>{l.label}</span>
                      <span
                        aria-hidden
                        className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-cream-200 py-5 sm:py-6 text-xs sm:text-sm text-ink-400">
          <p className="leading-relaxed">© {new Date().getFullYear()} {BRAND.name} · A {BRAND.parentCompany} venture · Cooked with care in {BRAND.city}.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#" className="hover:text-ink-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-ink-700 transition-colors">FSSAI Lic. 12345678901234</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
