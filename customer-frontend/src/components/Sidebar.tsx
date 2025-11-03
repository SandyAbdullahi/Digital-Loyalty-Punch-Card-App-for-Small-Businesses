import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Programs', path: '/dashboard', icon: '🎯' }, // Since programs are shown in dashboard
  { name: 'Scan QR', path: '/scan', icon: '📱' },
  { name: 'Rewards', path: '/rewards', icon: '🎁' },
  { name: 'Profile', path: '/profile', icon: '👤' },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full bg-rudi-teal text-white transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-white/20">
        <Logo className="h-8 w-auto transform scale-[0.4]" />
        {!isCollapsed && <span className="ml-2 text-lg font-bold">Rudi</span>}
      </div>

      <nav className="flex-1 flex flex-col justify-center space-y-2 px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-rudi-yellow text-rudi-maroon'
                  : 'text-white hover:bg-teal-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 rounded-full bg-rudi-teal p-1 text-white shadow-lg hover:bg-teal-500 md:hidden"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  )
}