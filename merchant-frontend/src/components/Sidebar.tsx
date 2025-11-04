import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
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

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Programs', to: '/programs', icon: Stamp },
  { name: 'QR Issuance', to: '/qr', icon: QrCode },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Rewards', to: '/rewards', icon: Gift },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings2 },
]

const SidebarLink = ({
  name,
  to,
  icon: Icon,
  onNavigate,
}: {
  name: string
  to: string
  icon: LucideIcon
  onNavigate?: () => void
}) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      [
        'group my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-white hover:bg-primary/15 hover:text-white',
      ].join(' ')
    }
  >
    <Icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-150" />
    <span>{name}</span>
  </NavLink>
)

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
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
      {navigation.map((item) => (
        <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
    <p className="text-xs text-white/60">
      Nice work — another happy customer is just one scan away.
    </p>
  </div>
)

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
