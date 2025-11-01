import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@rudi/ui'

export default function Dashboard() {
  const { logout } = useAuth()

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
        <Button onClick={logout} variant="outline">Logout</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/programs" className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Programs</h2>
          <p>Manage loyalty programs</p>
        </Link>
        <Link to="/locations" className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Locations</h2>
          <p>Manage store locations</p>
        </Link>
        <Link to="/qr" className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">QR Codes</h2>
          <p>Generate QR codes</p>
        </Link>
      </div>
    </div>
  )
}