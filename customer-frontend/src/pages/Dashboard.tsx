import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import ProgramCard from '../components/ProgramCard';
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
        const response = await axios.get<Membership[]>('/api/v1/customer/memberships');
        setMemberships(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Could not load your programmes.');
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
    <main className="pb-24">
      <header className="px-4 pt-10 pb-6 max-w-md mx-auto">
        <div className="rudi-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-rudi-maroon/70">Welcome back</p>
            <h1 className="font-heading text-2xl font-semibold">
              {user?.email?.split('@')[0] ?? 'Rudi Explorer'}
            </h1>
          </div>
          <button
            type="button"
            className="rudi-btn rudi-btn--secondary px-4 text-sm"
            onClick={() => navigate('/scan')}
          >
            Scan QR
          </button>
        </div>
      </header>
      <section className="px-4 space-y-6 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rudi-maroon/40" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#EADCC7] bg-[#FFF9F0] text-sm placeholder:text-rudi-maroon/50 focus:outline-none focus:ring-2 focus:ring-rudi-teal transition"
            placeholder="Search your favourite merchants"
          />
        </div>
        {loading && (
          <p className="text-center text-sm text-rudi-maroon/70">Loading your programmes…</p>
        )}
        {error && (
          <p className="text-sm text-rudi-coral bg-rudi-coral/10 px-3 py-2 rounded-md">{error}</p>
        )}
        {!loading && !error && filteredMemberships.length === 0 && (
          <div className="rudi-card p-6 text-center space-y-2">
            <h2 className="font-heading text-lg">No programmes yet</h2>
            <p className="text-sm text-rudi-maroon/75">
              Scan a QR code at a participating merchant to start collecting stamps.
            </p>
            <button
              type="button"
              className="rudi-btn rudi-btn--primary w-full md:w-auto md:px-6 mx-auto"
              onClick={() => navigate('/scan')}
            >
              Scan now
            </button>
          </div>
        )}
        <div className="space-y-4">
          {filteredMemberships.map((membership) => (
            <ProgramCard
              key={membership.id}
              id={membership.program_id}
              merchantName={membership.program?.merchant?.name ?? `Programme ${membership.program_id}`}
              merchantAddress={membership.program?.merchant?.address}
              earned={membership.current_balance}
              threshold={thresholdFor(membership)}
              actionLabel="View"
              onAction={() => handleNavigate(membership)}
            />
          ))}
        </div>
      </section>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-rudi-maroon/10 py-3 px-6 flex items-center justify-around"
        aria-label="Primary"
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center text-sm font-semibold text-rudi-teal"
        >
          <span className="text-lg">🏠</span>
          Home
        </button>
        <button
          type="button"
          onClick={() => navigate('/rewards')}
          className="flex flex-col items-center text-sm text-rudi-maroon/70"
        >
          <span className="text-lg">🎁</span>
          Rewards
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center text-sm text-rudi-maroon/70"
        >
          <span className="text-lg">👤</span>
          Profile
        </button>
      </nav>
    </main>
  );
};

export default Dashboard;
