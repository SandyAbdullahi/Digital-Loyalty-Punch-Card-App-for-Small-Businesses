import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Programs', path: '/dashboard', icon: '🎯' },
  { name: 'QR Issuance', path: '/scan', icon: '📱' },
  { name: 'Customers', path: '/dashboard', icon: '👥' },
  { name: 'Rewards', path: '/rewards', icon: '🎁' },
  { name: 'Analytics', path: '/dashboard', icon: '📊' },
  { name: 'Settings', path: '/profile', icon: '⚙️' },
]

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation()

  return (
    <div
      className={`fixed left-0 top-0 z-40 h-full bg-rudi-teal text-white transition-all duration-300 flex flex-col w-60 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-white/20">
        <Logo className="h-8 w-auto transform scale-[0.4]" />
        <span className="ml-2 text-lg font-bold">Rudi</span>
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
              <span className="ml-3">{item.name}</span>
            </Link>
          )
        })}
      </nav>


    </div>
  )
}