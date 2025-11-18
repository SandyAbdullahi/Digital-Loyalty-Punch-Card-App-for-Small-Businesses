import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart2, Building2, CreditCard, FileSpreadsheet, Home, Users, UserX } from 'lucide-react'

const links = [
  { to: '/dev', label: 'Overview', icon: Home },
  { to: '/dev/merchants', label: 'Merchants', icon: Building2 },
  { to: '/dev/customers', label: 'Customers', icon: Users },
  { to: '/dev/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/dev/revenue', label: 'Revenue', icon: BarChart2 },
  { to: '/dev/leads', label: 'Leads', icon: FileSpreadsheet },
  { to: '/dev/controls', label: 'Controls', icon: UserX },
]

const DeveloperSidebar = () => {
  return (
    <Fragment>
      <div className="fixed inset-y-0 z-40 hidden w-64 lg:block">
        <div
          className="sidebar-panel flex h-full flex-col gap-4 px-5 py-6 shadow-2xl"
          style={{ background: 'linear-gradient(180deg, var(--sidebar) 0%, var(--surface-muted) 100%)' }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--sidebar-border)] bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--sidebar-border)] bg-white font-heading text-base font-bold text-[var(--sidebar-foreground)]">
              Dev
            </div>
            <div className="text-left" style={{ color: 'var(--sidebar-foreground)' }}>
              <p className="text-[11px] uppercase tracking-wide opacity-70">Rudi Platform</p>
              <p className="text-lg font-heading font-semibold">Developer</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'sidebar-link flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors duration-150',
                    isActive ? 'sidebar-link-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div
            className="rounded-xl border border-[var(--sidebar-border)] bg-white/60 px-4 py-3 text-xs shadow-sm backdrop-blur"
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            <p className="font-semibold">Platform control</p>
            <p className="opacity-75">Manage merchants, subscriptions, and leads from one view.</p>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default DeveloperSidebar
