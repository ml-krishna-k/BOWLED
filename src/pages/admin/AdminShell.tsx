import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminBottomNav } from '@/components/admin/AdminBottomNav'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { useAuth } from '@/context/AuthContext'

export function AdminShell() {
  const navigate = useNavigate()
  const loc = useLocation()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
      return
    }
    if (isAuthenticated && !user?.isAdmin) {
      navigate('/app/home', { replace: true })
    }
  }, [isAuthenticated, loading, user, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  if (loading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <div className="text-ink-500">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <AdminTopBar />
          <main className="pb-24 lg:pb-12">
            <Outlet />
          </main>
        </div>
      </div>
      <AdminBottomNav />
    </div>
  )
}
