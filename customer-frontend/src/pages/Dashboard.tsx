import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../components/ProgramCard';
import { BottomNav } from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
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

  const firstName = user?.email?.split('@')[0] ?? 'Explorer';

  const thresholdFor = (membership: Membership) =>
    membership.program?.reward_threshold ?? 10;

  const actionLabelFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership) ? 'View' : 'Scan QR';

  const actionHandlerFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership)
      ? () => navigate(`/program/${membership.program_id}`, { state: { membership } })
      : () => navigate('/scan');

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-rudi-sand pb-24 md:ml-60">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-rudi-maroon">
              Welcome, {firstName}
            </h1>
            <div className="h-10 w-10 rounded-full bg-rudi-teal/10 flex items-center justify-center text-rudi-teal font-semibold">
              {user?.email?.[0].toUpperCase() ?? 'G'}
            </div>
          </div>
          <div className="mx-4 mb-3">
            <input
              type="search"
              placeholder="Search programs..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full h-11 rounded-full bg-white/80 backdrop-blur px-4 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rudi-teal focus:border-transparent"
            />
          </div>
        </header>

        <section className="overflow-y-auto">
          <div className="py-4">
            {loading && (
              <p className="text-center text-sm text-rudi-maroon/70">
                Loading your programmes...
              </p>
            )}
            {error && (
              <div className="mx-4 mb-3">
                <p className="text-sm px-3 py-2 rounded-md bg-red-50 text-red-600">
                  {error}
                </p>
              </div>
            )}
            {!loading && !error && filteredMemberships.length === 0 && (
              <div className="mx-4 mb-3">
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
              <div key={membership.id} className="mx-4 mb-3">
                <ProgramCard
                  id={membership.id}
                  merchantName={
                    membership.program?.merchant?.name ??
                    `Programme ${membership.program_id}`
                  }
                  merchantAddress={
                    membership.program?.merchant?.address ??
                    'Address not available'
                  }
                  earned={membership.current_balance}
                  threshold={thresholdFor(membership)}
                  actionLabel={actionLabelFor(membership)}
                  onAction={actionHandlerFor(membership)}
                  logoUrl={membership.program?.merchant?.logo_url}
                />
              </div>
            ))}
          </div>
        </section>
        <BottomNav />
      </main>
    </>
  );
};

export default Dashboard;

