import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import About from './pages/About'
import Contact from './pages/Contact'
import Pricing from './pages/Pricing'
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
import GetStarted from './pages/GetStarted'
import GetApp from './pages/GetApp'
import DemoDashboard from './pages/DemoDashboard'
import HowItWorks from './pages/HowItWorks'
import ForMerchants from './pages/ForMerchants'

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
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-merchants" element={<ForMerchants />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/get-app" element={<GetApp />} />
        <Route path="/demo" element={<DemoDashboard />} />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
