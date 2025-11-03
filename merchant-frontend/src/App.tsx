import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import QR from './pages/QR'
import Programs from './pages/Programs'
import Register from './pages/Register'
import Customers from './pages/Customers'
import Rewards from './pages/Rewards'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import Locations from './pages/Locations'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? <>{children}</> : <Navigate to="/login" />
}

const ProtectedApp = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
)

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route element={<ProtectedApp />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/locations" element={<Locations />} />
        </Route>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
