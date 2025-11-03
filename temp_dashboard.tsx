import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StampDots from '../components/StampDots';
import { useAuth } from '../contexts/AuthContext';

type Membership = {
  id: string;
  program_id: string;
  current_balance: number;
  program?: {
    id: string;
    name?: string;
    reward_threshold?: number;
    merchant?: {
      name?: string;
      address?: string;
      logo_url?: string;
    };
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get<Membership[]>(
          '/api/v1/customer/memberships'
        );
        setMemberships(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ?? 'Could not load your programmes.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const filteredMemberships = useMemo(() => {
    if (!query) return memberships;
    return memberships.filter((membership) => {
      const merchantName = membership.program?.merchant?.name ?? '';
      return merchantName.toLowerCase().includes(query.toLowerCase());
    });
  }, [memberships, query]);

  const handleNavigate = (membership: Membership) => {
    navigate(`/program/${membership.program_id}`, { state: { membership } });
  };

  const thresholdFor = (membership: Membership) =>
    membership.program?.reward_threshold ?? 10;

  return (
    <main className="min-h-screen bg-rudi-sand pb-16">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-rudi-maroon">
            Welcome, {user?.email?.split('@')[0] ?? 'Rudi Explorer'}
          </h1>
          <div className="h-10 w-10 rounded-full bg-rudi-teal/10 flex items-center justify-center text-rudi-teal font-semibold">
            {user?.email?.[0].toUpperCase() ?? 'G'}
          </div>
        </div>
        <div className="px-4 pb-4">
          <input
            type="search"
            placeholder="Search programs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 rounded-full bg-white/80 backdrop-blur px-4 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rudi-teal focus:border-transparent"
          />
        </div>
      </header>

      <section className="overflow-y-auto">
        <div className="py-4 space-y-3">
          {loading && (
            <p className="text-center text-sm text-rudi-maroon/70">
              Loading your programmes…
            </p>
          )}
          {error && (
            <div className="mx-4">
              <p className="text-sm px-3 py-2 rounded-md bg-red-50 text-red-600">
                {error}
              </p>
            </div>
          )}
          {!loading && !error && filteredMemberships.length === 0 && (
            <div className="mx-4">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="font-heading text-lg text-rudi-maroon">
                  No programmes yet
                </h2>
                <p className="text-sm text-rudi-maroon/70 mt-1">
                  Scan a QR code at a participating merchant to start collecting
                  stamps.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="w-full h-12 mt-4 rounded-xl bg-rudi-yellow text-rudi-maroon font-semibold hover:bg-rudi-yellow/90 transition-colors"
                >
                  Scan now
                </button>
              </div>
            </div>
          )}
          {filteredMemberships.map((membership) => (
            <div key={membership.id} className="mx-4">
              <div className="bg-white p-4 rounded-2xl shadow-md flex gap-3 items-start">
                <div className="w-12 h-12 rounded-full bg-rudi-teal/10 flex items-center justify-center text-rudi-teal font-bold overflow-hidden">
                  {membership.program?.merchant?.logo_url ? (
                    <img
                      src={membership.program.merchant.logo_url}
                      alt={membership.program?.merchant?.name ?? 'Merchant'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(membership.program?.merchant?.name ??
                        'M')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-rudi-maroon">
                    {membership.program?.merchant?.name ??
                      `Programme ${membership.program_id}`}
                  </h3>
                  <p className="text-sm text-rudi-maroon/70">
                    {membership.program?.merchant?.address ??
                      'Address not available'}
                  </p>
                  <StampDots
                    earned={membership.current_balance}
                    threshold={thresholdFor(membership)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate(membership)}
                  className="h-8 px-3 rounded-lg bg-rudi-yellow text-rudi-maroon text-sm font-semibold hover:bg-rudi-yellow/90 transition-colors whitespace-nowrap"
                >
                  {membership.current_balance >= thresholdFor(membership)
                    ? 'Redeem'
                    : 'Scan QR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-teal-600"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/rewards')}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-rudi-maroon"
          >
            <span className="text-2xl">🎁</span>
            <span className="text-xs mt-1">Rewards</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-rudi-maroon"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </main>
  );
};

export default Dashboard;

