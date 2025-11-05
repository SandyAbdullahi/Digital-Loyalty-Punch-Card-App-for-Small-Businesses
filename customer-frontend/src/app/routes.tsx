import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import HowItWorks from '../pages/HowItWorks';
import Terms from '../pages/Terms';
import Dashboard from '../pages/Dashboard';
import ProgramDetail from '../pages/ProgramDetail';
import Scan from '../pages/Scan';
import Rewards from '../pages/Rewards';
import Profile from '../pages/Profile';

const FullScreenLoader = () => (
  <div className="min-h-screen bg-rudi-sand text-rudi-maroon flex items-center justify-center font-body">
    <div className="text-center space-y-2">
      <div className="w-12 h-12 border-4 border-rudi-teal border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm font-semibold tracking-wide uppercase">Loading</p>
    </div>
  </div>
);

const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/terms" element={<Terms />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/program/:id" element={<ProgramDetail />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
