import type { ReactNode } from 'react'

export interface AdminNavItem {
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

export const ADMIN_NAV: AdminNavItem[] = [
  {
    to: '/admin/overview',
    label: 'Overview',
    icon: sv(
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>,
    ),
  },
  {
    to: '/admin/deliveries',
    label: 'Deliveries',
    icon: sv(
      <>
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>,
    ),
  },
  // 'Scan QR' is no longer a top-level nav item — the real camera scanner
  // now lives inside the Deliveries page as a modal launched from the
  // 'Scan QR' button at the top of the list.
  {
    to: '/admin/payments',
    label: 'Payments',
    icon: sv(
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </>,
    ),
  },
  {
    to: '/admin/subscribers',
    label: 'Subscribers',
    icon: sv(
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 19c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M21 19c0-2.5-1.6-4-4-4" />
      </>,
    ),
  },
  {
    to: '/admin/menu',
    label: 'Menu',
    icon: sv(
      <>
        <path d="M5 4h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" />
        <path d="M9 9h6M9 13h4" />
      </>,
    ),
  },
  {
    to: '/admin/kitchens',
    label: 'Kitchens',
    icon: sv(
      <>
        <path d="M4 19h16" />
        <path d="M5 19a7 7 0 1 1 14 0" />
        <path d="M12 5V3" />
      </>,
    ),
  },
]
