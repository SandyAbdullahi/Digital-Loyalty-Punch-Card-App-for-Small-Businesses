import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rudi/ui'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type TopBarProps = {
  onToggleSidebar: () => void
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const { user, merchant, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = merchant?.display_name || (user?.email?.split('@')[0]?.replace(/\W+/g, ' ') ?? 'Rudi Merchant')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 backdrop-blur-md shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-transform duration-150 hover:-translate-y-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/60">Welcome back</p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {displayName}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-1.5 shadow-sm transition transform duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {merchant?.logo_url ? (
              <img
                src={merchant.logo_url}
                alt="Merchant logo"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                {user?.email?.[0]?.toUpperCase() ?? 'R'}
              </div>
            )}
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              <span className="text-xs text-foreground/60">Mission Control</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border shadow-lg bg-primary text-white">
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-white/70">
            Quick actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="rounded-lg text-sm font-medium text-white hover:bg-primary/80 hover:text-black cursor-pointer"
            onSelect={(event: Event) => {
              event.preventDefault()
              navigate('/settings')
            }}
          >
            Profile & Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-lg text-sm font-medium text-white hover:bg-primary/80 hover:text-black cursor-pointer"
            onSelect={(event: Event) => {
              event.preventDefault()
              logout()
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default TopBar
