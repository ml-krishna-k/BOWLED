import type { ReactNode } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const sv = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
)

export const APP_NAV: NavItem[] = [
  {
    to: '/app/home',
    label: 'Home',
    icon: sv(<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />),
  },
  {
    to: '/app/menu',
    label: 'Menu',
    icon: sv(
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h10" />
      </>,
    ),
  },
  {
    to: '/app/subscription',
    label: 'Plan',
    icon: sv(
      <>
        <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 7l3-4h12l3 4M9 12h6" />
      </>,
    ),
  },
  {
    to: '/app/skip',
    label: 'Skip',
    icon: sv(
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
        <path d="m9 14 6 4M15 14l-6 4" />
      </>,
    ),
  },
  {
    to: '/app/profile',
    label: 'You',
    icon: sv(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
      </>,
    ),
  },
]
