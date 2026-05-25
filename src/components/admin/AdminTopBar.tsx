import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'

export function AdminTopBar() {
  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-cream-200 bg-cream-50/85 backdrop-blur-lg px-4 py-3"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <Link to="/admin/overview" className="flex items-center gap-2">
        <Logo showWordmark={false} />
        <Badge tone="ink">Admin</Badge>
      </Link>
    </header>
  )
}
