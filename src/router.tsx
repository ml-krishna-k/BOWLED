import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Eager — these are the LCP-critical / first-paint surfaces. Home is the
// landing target for most cold visits; the SEO landing template reuses the
// same primitives, so making it lazy doesn't shrink Home's bundle materially.
import { Home } from '@/pages/Home'
import { LocalSeoLanding } from '@/pages/seo/LocalSeoLanding'
import { LANDINGS } from '@/data/seo-landings'

/* Lazy — every other route. The cost of the dynamic import is amortised by
 * never loading these on the landing page. Each route is bundled into its
 * own chunk by Vite. */
const ScanPage              = lazy(() => import('@/pages/Scan').then((m) => ({ default: m.ScanPage })))
const LoginPage             = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage })))
const OtpPage               = lazy(() => import('@/pages/auth/Otp').then((m) => ({ default: m.OtpPage })))
const SignupPage            = lazy(() => import('@/pages/auth/Signup').then((m) => ({ default: m.SignupPage })))
const AppShell              = lazy(() => import('@/pages/app/AppShell').then((m) => ({ default: m.AppShell })))
const Dashboard             = lazy(() => import('@/pages/app/Dashboard').then((m) => ({ default: m.Dashboard })))
const MenuPage              = lazy(() => import('@/pages/app/MenuPage').then((m) => ({ default: m.MenuPage })))
const QrPass                = lazy(() => import('@/pages/app/QrPass').then((m) => ({ default: m.QrPass })))
const SubscriptionPage      = lazy(() => import('@/pages/app/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })))
const SkipMealsPage         = lazy(() => import('@/pages/app/SkipMeals').then((m) => ({ default: m.SkipMealsPage })))
const Profile               = lazy(() => import('@/pages/app/Profile').then((m) => ({ default: m.Profile })))
const AdminShell            = lazy(() => import('@/pages/admin/AdminShell').then((m) => ({ default: m.AdminShell })))
const AdminOverview         = lazy(() => import('@/pages/admin/Overview').then((m) => ({ default: m.AdminOverview })))
const AdminPayments         = lazy(() => import('@/pages/admin/Payments').then((m) => ({ default: m.AdminPayments })))
const AdminScan             = lazy(() => import('@/pages/admin/Scan').then((m) => ({ default: m.AdminScan })))
const AdminSubscribers      = lazy(() => import('@/pages/admin/Subscribers').then((m) => ({ default: m.AdminSubscribers })))
const AdminSubscriberDetail = lazy(() => import('@/pages/admin/SubscriberDetail').then((m) => ({ default: m.AdminSubscriberDetail })))
const AdminDeliveries       = lazy(() => import('@/pages/admin/Deliveries').then((m) => ({ default: m.AdminDeliveries })))
const AdminMenuEditor       = lazy(() => import('@/pages/admin/MenuEditor').then((m) => ({ default: m.AdminMenuEditor })))
const AdminKitchens         = lazy(() => import('@/pages/admin/Kitchens').then((m) => ({ default: m.AdminKitchens })))

/**
 * Suspense boundary used while route chunks fetch. Visually quiet — a tiny
 * spinning ring on a cream background, no layout shift, no flash.
 */
function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-screen grid place-items-center bg-cream-50"
    >
      <div className="h-8 w-8 rounded-full border-2 border-cream-300 border-t-saffron-500 animate-spin" />
    </div>
  )
}

/** Wraps a route element in a Suspense boundary. */
function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },

  // SEO landing pages — one route per slug, all sharing one template.
  // Slugs come from src/data/seo-landings.ts and are also in sitemap.xml.
  ...LANDINGS.map((l) => ({
    path: `/${l.slug}`,
    element: <LocalSeoLanding slug={l.slug} />,
  })),

  // Public rider scan endpoint — no auth, JWT in the URL is the auth.
  { path: '/scan/:token', element: withSuspense(<ScanPage />) },

  { path: '/auth/login',  element: withSuspense(<LoginPage />) },
  { path: '/auth/signup', element: withSuspense(<SignupPage />) },
  { path: '/auth/otp',    element: withSuspense(<OtpPage />) },

  {
    path: '/app',
    element: withSuspense(<AppShell />),
    children: [
      { index: true, element: <Navigate to="/app/home" replace /> },
      { path: 'home',         element: withSuspense(<Dashboard />) },
      { path: 'menu',         element: withSuspense(<MenuPage />) },
      { path: 'qr',           element: withSuspense(<QrPass />) },
      { path: 'subscription', element: withSuspense(<SubscriptionPage />) },
      { path: 'skip',         element: withSuspense(<SkipMealsPage />) },
      { path: 'profile',      element: withSuspense(<Profile />) },
    ],
  },

  {
    path: '/admin',
    element: withSuspense(<AdminShell />),
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: 'overview',         element: withSuspense(<AdminOverview />) },
      { path: 'scan',             element: withSuspense(<AdminScan />) },
      { path: 'payments',         element: withSuspense(<AdminPayments />) },
      { path: 'deliveries',       element: withSuspense(<AdminDeliveries />) },
      { path: 'subscribers',      element: withSuspense(<AdminSubscribers />) },
      { path: 'subscribers/:id',  element: withSuspense(<AdminSubscriberDetail />) },
      { path: 'menu',             element: withSuspense(<AdminMenuEditor />) },
      { path: 'kitchens',         element: withSuspense(<AdminKitchens />) },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
