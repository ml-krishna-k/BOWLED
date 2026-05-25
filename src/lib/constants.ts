export const BRAND = {
  name: 'Bowled',
  tagline: 'Home-style daily meals for students',
  parentCompany: 'Sree Krishna Catering',
  parentSince: 2006,
  yearsOfHeritage: new Date().getFullYear() - 2006,
  launchedAt: 'May 5, 2025',
  activeUsers: 300,
  city: 'Chennai',
  email: 'care@bowled.in',
  phone: '+91 90000 00000',
} as const

export const NAV_LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Weekly menu',  href: '#menu' },
  { label: 'Plans',        href: '#plans' },
  { label: 'Our kitchen',  href: '#kitchen' },
  { label: 'FAQ',          href: '#faq' },
] as const
