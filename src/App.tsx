import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { AdminProvider } from '@/context/AdminContext'
import { router } from '@/router'

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}
