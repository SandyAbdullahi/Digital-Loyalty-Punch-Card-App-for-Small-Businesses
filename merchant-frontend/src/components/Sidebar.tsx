import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Gift,
  LayoutDashboard,
  QrCode,
  Settings2,
  Stamp,
  Users,
} from 'lucide-react'
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
        'group my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-white hover:text-white',
      ].join(' ')
    }
  >
    <div className="relative">
      <Icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
      {unreadCount && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
    <div className="flex h-full flex-col gap-6 bg-foreground px-5 py-6 text-white shadow-2xl lg:px-6">
      <div className="flex flex-col items-center gap-2 bg-black/80 rounded-xl px-3 py-2">
        <img
          src="/logo-1.png"
          alt="Rudi Logo"
          className="h-10 w-10 rounded-xl object-cover"
        />
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-white/70">Rudi Merchant</p>
          <p className="text-lg font-heading font-semibold text-white">Mission Control</p>
        </div>
      </div>
       <nav className="flex-1">
         {getNavigation(isDemo).map((item, index) => (
           <SidebarLink
             key={`${item.name}-${index}`}
             {...item}
             onNavigate={onNavigate}
             unreadCount={item.name === 'Rewards' ? unreadRedeemCount : undefined}
           />
         ))}
         {isDemo && (
           <div className="mt-4 pt-4 border-t border-white/20">
             <a
               href="/"
               className="group my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors text-white hover:bg-white/10 hover:text-white"
             >
               <span>← Back to Home</span>
             </a>
           </div>
         )}
       </nav>
       <p className="text-xs text-white/60">
         Nice work — another happy customer is just one scan away.
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
