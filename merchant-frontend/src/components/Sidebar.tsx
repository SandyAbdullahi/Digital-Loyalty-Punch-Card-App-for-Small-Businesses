import { Fragment, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Gift, LayoutDashboard, QrCode, Settings2, Stamp, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@rudi/ui'
import { useWebSocket } from '../contexts/WebSocketContext'

const merchantTips = [
  "Building customer loyalty starts with consistent quality service.",
  "Personalize your offers to make customers feel valued.",
  "Reward repeat visits to encourage loyalty.",
  "Use data to understand customer preferences.",
  "Communicate regularly with your customers.",
  "Offer exclusive deals to loyal customers.",
  "Train staff to provide excellent customer service.",
  "Collect feedback to improve your business.",
  "Create a sense of community among your customers.",
  "Be transparent about your business practices.",
  "Loyalty programs can increase customer retention by up to 20%.",
  "Engage customers on social media to build relationships.",
  "Surprise customers with unexpected perks.",
  "Segment your customer base for targeted marketing.",
  "Focus on customer lifetime value, not just one-time sales.",
  "Respond quickly to customer inquiries and complaints.",
  "Use email marketing to nurture customer relationships.",
  "Offer referral programs to leverage word-of-mouth.",
  "Consistency in branding builds trust.",
  "Monitor customer satisfaction scores regularly.",
  "Invest in customer education about your products.",
  "Create emotional connections with your customers.",
  "Loyalty is built through trust and reliability.",
  "Use storytelling in your marketing to engage customers.",
  "Offer value-added services to differentiate your business.",
  "Track and reward customer milestones.",
  "Collaborate with influencers to reach new audiences.",
  "Implement a CRM system to manage customer interactions.",
  "Focus on customer experience at every touchpoint.",
  "Celebrate customer anniversaries or special occasions.",
  "Use loyalty apps to make engagement easier.",
  "Analyze churn reasons to prevent customer loss.",
  "Provide exceptional after-sales support.",
  "Customize communications based on customer behavior.",
  "Build partnerships for cross-promotions.",
]

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
  const [currentTip] = useState(() => merchantTips[Math.floor(Math.random() * merchantTips.length)])

  return (
    <div
      className="sidebar-panel flex h-full flex-col gap-6 rounded-r-3xl px-5 py-6 shadow-2xl lg:px-6"
      style={{ background: 'linear-gradient(180deg, var(--sidebar) 0%, var(--surface-muted) 100%)' }}
    >
      <div
        className="flex flex-col gap-3 rounded-2xl border border-[var(--sidebar-border)] px-4 py-3 text-center shadow-sm backdrop-blur"
        style={{
          background: 'linear-gradient(135deg, rgba(0,150,136,0.08), rgba(255,179,0,0.08))',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <img src="/logo-1.png" alt="Rudi Logo" className="h-10 w-10 rounded-xl border border-[var(--sidebar-border)] bg-white object-cover" />
          <div className="text-center" style={{ color: 'var(--sidebar-foreground)' }}>
            <p className="text-[11px] uppercase tracking-wide opacity-70">Rudi Merchant</p>
            <p className="text-lg font-heading font-semibold">Mission Control</p>
          </div>
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
        <div
          className="rounded-xl border border-[var(--sidebar-border)] bg-white/70 px-4 py-3 text-xs shadow-sm backdrop-blur"
          style={{ color: 'var(--sidebar-foreground)' }}
        >
          <p className="font-semibold">Merchant Tip</p>
          <p className="opacity-75">{currentTip}</p>
        </div>
    </div>
  )
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => (
  <Fragment>
    <div className="fixed inset-y-0 z-40 hidden w-60 lg:block">
      <SidebarContent />
    </div>
    <Dialog open={isOpen} onOpenChange={(open: boolean) => (!open ? onClose() : undefined)}>
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
