import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { useOnline } from './hooks/useOnline';
import { useAuth } from './contexts/AuthContext';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import AppRoutes from './app/routes';

function AppContent() {
  const isOnline = useOnline();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lastCheckedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const checkRedemptions = async () => {
      try {
        // Get all memberships
        const membershipsResponse = await axios.get('/api/v1/customer/memberships');
        const memberships = membershipsResponse.data;

        // Check redemptions for each program
        for (const membership of memberships) {
          const programId = membership.program_id;
          const response = await axios.get(`/api/v1/programs/${programId}/redemptions`);
          const redemptions = response.data;

          for (const redemption of redemptions) {
            const key = `${programId}-${redemption.id}`;
            const lastStatus = lastCheckedRef.current[key];

            // If this redemption was claimed and is now redeemed, redirect
            if (lastStatus === 'claimed' && redemption.status === 'redeemed') {
              // Only redirect if not already on dashboard
              if (location.pathname !== '/dashboard') {
                navigate('/dashboard');
                return; // Stop checking after first redirect
              }
            }

            // Update last known status
            lastCheckedRef.current[key] = redemption.status;
          }
        }
      } catch (error) {
        console.error('Failed to check redemptions:', error);
      }
    };

    // Initial check
    checkRedemptions();

    // Poll every 3 seconds
    const interval = setInterval(checkRedemptions, 3000);

    return () => clearInterval(interval);
  }, [user, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-rudi-sand text-rudi-maroon font-body">
      {!isOnline && (
        <div className="bg-rudi-coral text-white text-center py-2 text-sm">
          You are offline. Some features may be limited.
        </div>
      )}
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
