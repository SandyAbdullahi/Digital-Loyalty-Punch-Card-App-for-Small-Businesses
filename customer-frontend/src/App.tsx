import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useOnline } from './hooks/useOnline'
import Scan from './pages/Scan'
import Loyalty from './pages/Loyalty'
import Login from './pages/Login'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function App() {
  const { user, loading } = useAuth()
  const isOnline = useOnline()

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center p-2">
          You are offline. Some features may not be available.
        </div>
      )}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/scan" /> : <Login />} />
        <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? "/scan" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App