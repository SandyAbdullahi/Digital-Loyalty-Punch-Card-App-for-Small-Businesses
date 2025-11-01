import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@rudi/ui'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Rudi Loyalty</h1>
        <Button onClick={logout} variant="outline">Logout</Button>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <nav className="bg-white border-t p-4 flex justify-around">
        <Link
          to="/scan"
          className={`flex flex-col items-center ${location.pathname === '/scan' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <span>📱</span>
          <span className="text-sm">Scan</span>
        </Link>
        <Link
          to="/loyalty"
          className={`flex flex-col items-center ${location.pathname === '/loyalty' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <span>🏆</span>
          <span className="text-sm">Loyalty</span>
        </Link>
      </nav>
    </div>
  )
}