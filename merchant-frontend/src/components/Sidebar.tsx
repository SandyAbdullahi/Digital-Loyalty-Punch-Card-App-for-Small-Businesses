import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Gift, LayoutDashboard, QrCode, Settings2, Stamp, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@rudi/ui'
import { useWebSocket } from '../contexts/WebSocketContext'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const getNavigation = (isDemo: boolean) => [
  { name: 'Dashboard', to: isDemo ? '/demo/dashboard' : '/dashboard', icon: LayoutDashboard },
  { name: 'Programs', to: isDemo ? '/demo/programs' : '/programs', icon: Stamp },
  { name: 'QR Issuance', to: isDemo ? '/demo/qr' : '/qr', icon: QrCode },
  { name: 'Customers', to: isDemo ? '/demo/customers' : '/customers', icon: Users },
  { name: 'Rewards', to: isDemo ? '/demo/rewards' : '/rewards', icon: Gift },
  { name: 'Analytics', to: isDemo ? '/demo/analytics' : '/analytics', icon: BarChart3 },
  { name: 'Settings', to: isDemo ? '/demo/settings' : '/settings', icon: Settings2 },
]

const SidebarLink = ({
  name,
  to,
  icon: Icon,
  onNavigate,
  unreadCount,
}: {
  name: string
  to: string
  icon: LucideIcon
  onNavigate?: () => void
  unreadCount?: number
}) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      [
        'sidebar-link group my-1 flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors duration-150',
        isActive ? 'sidebar-link-active' : '',
      ]
        .filter(Boolean)
        .join(' ')
    }
  >
    <div className="relative">
      <Icon className="h-5 w-5 text-inherit transition-transform duration-150 group-hover:scale-105" />
      {unreadCount && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
    <span>{name}</span>
  </NavLink>
)

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { unreadRedeemCount } = useWebSocket()
  const location = useLocation()
  const isDemo = location.pathname.startsWith('/demo')

  return (
    <div className="sidebar-panel flex h-full flex-col gap-6 rounded-r-3xl px-5 py-6 shadow-2xl lg:px-6">
      <div
        className="flex flex-col items-center gap-2 rounded-xl px-3 py-2 text-center"
        style={{ backgroundColor: 'var(--sidebar-hover)' }}
      >
        <img src="/logo-1.png" alt="Rudi Logo" className="h-10 w-10 rounded-xl object-cover" />
        <div className="text-center" style={{ color: 'var(--sidebar-foreground)' }}>
          <p className="text-sm uppercase tracking-wide opacity-70">Rudi Merchant</p>
          <p className="text-lg font-heading font-semibold">Mission Control</p>
        </div>
      </div>
      <nav className="flex-1">
        {getNavigation(isDemo).map((item) => (
          <SidebarLink
            key={item.name}
            {...item}
            onNavigate={onNavigate}
            unreadCount={item.name === 'Rewards' ? unreadRedeemCount : undefined}
          />
        ))}
        {isDemo && (
          <div className="mt-4 border-t border-[var(--sidebar-border)] pt-4">
            <a
              href="/"
              className="sidebar-link inline-flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors duration-150"
            >
              <span>Back to home</span>
            </a>
          </div>
        )}
      </nav>
      <p className="text-xs" style={{ color: 'var(--sidebar-foreground)', opacity: 0.75 }}>
        Nice work -- another happy customer is just one scan away.
      </p>
    </div>
  )
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => (
  <Fragment>
    <div className="fixed inset-y-0 z-40 hidden w-60 lg:block">
      <SidebarContent />
    </div>
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-none">
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <DialogDescription className="sr-only">Merchant navigation menu</DialogDescription>
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent onNavigate={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  </Fragment>
)

export default Sidebar

