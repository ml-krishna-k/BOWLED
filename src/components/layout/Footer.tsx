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
      <Container className="relative">
        <div className="grid gap-10 py-16 sm:py-20 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-5">
            <Logo />
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
                  className="grid h-10 w-10 place-items-center rounded-full bg-paper border border-cream-200 text-ink-700 hover:border-saffron-400 hover:text-saffron-700 transition-colors"
                  aria-label={s}
                >
                  <span className="text-xs font-semibold">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-eyebrow mb-4 text-ink-900">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[15px] text-ink-500 hover:text-saffron-700 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-cream-200 py-6 text-sm text-ink-400">
          <p>© {new Date().getFullYear()} {BRAND.name} · A {BRAND.parentCompany} venture · Cooked with care in {BRAND.city}.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-ink-700">Privacy</a>
            <a href="#" className="hover:text-ink-700">Terms</a>
            <a href="#" className="hover:text-ink-700">FSSAI Lic. 12345678901234</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
