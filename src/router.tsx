import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { ScanPage } from '@/pages/Scan'
import { LoginPage } from '@/pages/auth/Login'
import { OtpPage } from '@/pages/auth/Otp'
import { SignupPage } from '@/pages/auth/Signup'
import { AppShell } from '@/pages/app/AppShell'
import { Dashboard } from '@/pages/app/Dashboard'
import { MenuPage } from '@/pages/app/MenuPage'
import { QrPass } from '@/pages/app/QrPass'
import { SubscriptionPage } from '@/pages/app/SubscriptionPage'
import { SkipMealsPage } from '@/pages/app/SkipMeals'
import { Profile } from '@/pages/app/Profile'
import { AdminShell } from '@/pages/admin/AdminShell'
import { AdminOverview } from '@/pages/admin/Overview'
import { AdminPayments } from '@/pages/admin/Payments'
import { AdminScan } from '@/pages/admin/Scan'
import { AdminSubscribers } from '@/pages/admin/Subscribers'
import { AdminSubscriberDetail } from '@/pages/admin/SubscriberDetail'
import { AdminDeliveries } from '@/pages/admin/Deliveries'
import { AdminMenuEditor } from '@/pages/admin/MenuEditor'
import { AdminKitchens } from '@/pages/admin/Kitchens'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },

  // Public rider scan endpoint — no auth, JWT in the URL is the auth.
  { path: '/scan/:token', element: <ScanPage /> },

  { path: '/auth/login',  element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  { path: '/auth/otp',    element: <OtpPage /> },

  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/home" replace /> },
      { path: 'home',         element: <Dashboard /> },
      { path: 'menu',         element: <MenuPage /> },
      { path: 'qr',           element: <QrPass /> },
      { path: 'subscription', element: <SubscriptionPage /> },
      { path: 'skip',         element: <SkipMealsPage /> },
      { path: 'profile',      element: <Profile /> },
    ],
  },

  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: 'overview',         element: <AdminOverview /> },
      { path: 'scan',             element: <AdminScan /> },
      { path: 'payments',         element: <AdminPayments /> },
      { path: 'deliveries',       element: <AdminDeliveries /> },
      { path: 'subscribers',      element: <AdminSubscribers /> },
      { path: 'subscribers/:id',  element: <AdminSubscriberDetail /> },
      { path: 'menu',             element: <AdminMenuEditor /> },
      { path: 'kitchens',         element: <AdminKitchens /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
