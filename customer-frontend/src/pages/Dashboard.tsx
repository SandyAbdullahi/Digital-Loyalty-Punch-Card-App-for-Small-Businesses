import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../components/ProgramCard';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';



type Membership = {
  id: string;
  customer_user_id: string;
  program_id: string;
  current_balance: number;
  joined_at: string;
  is_active: boolean;
  program: {
    id: string;
    name: string;
    description?: string;
    logic_type: string;
    earn_rule: any;
    redeem_rule: any;
    terms?: string;
    merchant_id: string;
    is_active: boolean;
    merchant: {
      id: string;
      display_name: string;
      legal_name?: string;
      logo_url?: string;
      category?: string;
      address?: string;
      description?: string;
      website?: string;
      phone?: string;
      owner_user_id: string;
      is_active: boolean;
      locations: any[];
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
      const merchantName = membership.program.merchant?.display_name ?? '';
      const programName = membership.program.name ?? '';
      return merchantName.toLowerCase().includes(query.toLowerCase()) ||
             programName.toLowerCase().includes(query.toLowerCase());
    });
  }, [memberships, query]);

  const firstName = user?.name || user?.email?.split('@')[0] || 'Explorer';

  const thresholdFor = (membership: Membership) => {
    if (membership.program.logic_type === 'punch_card') {
      return membership.program.earn_rule?.threshold ?? 10;
    }
    return 10; // default for points or other types
  };

  const actionLabelFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership) ? 'View' : 'Scan QR';

  const actionHandlerFor = (membership: Membership) =>
    membership.current_balance >= thresholdFor(membership)
      ? () => navigate(`/program/${membership.program_id}`, { state: { membership } })
      : () => navigate('/scan');

  return (
    <>
      <main className="min-h-screen bg-[var(--rudi-background)]">
        <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-black text-[var(--rudi-text)]">
            Welcome, {firstName}
          </h1>
          <img
            src={user?.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : `https://ui-avatars.com/api/?name=${firstName}&background=009688&color=fff&size=40`}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
          <div className="mx-4 mb-3">
            <input
              type="search"
              placeholder="Search programs..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full h-11 rounded-full bg-white/80 backdrop-blur px-4 py-2 mb-2 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--rudi-primary)] focus:border-transparent"
            />
          </div>
        </header>

        <section className="overflow-y-auto">
          <div className="py-4">
            {loading && (
              <p className="text-center text-sm text-[var(--rudi-text)]/70">
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
                  <h2 className="font-heading text-lg text-[var(--rudi-text)]">
                    No programmes yet
                  </h2>
                  <p className="text-sm text-[var(--rudi-text)]/70 mt-1">
                    Scan a QR code at a participating merchant to start collecting
                    stamps.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/scan')}
                    className="w-full h-12 mt-4 rounded-xl bg-[var(--rudi-secondary)] text-[var(--rudi-text)] font-semibold hover:bg-[var(--rudi-secondary)]/90 transition-colors"
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
                    membership.program.merchant?.display_name ??
                    `Merchant ${membership.program.merchant_id}`
                  }
                  programName={membership.program.name}
                  merchantAddress={
                    membership.program.merchant?.address ??
                    'Address not available'
                  }
                  earned={membership.current_balance}
                  threshold={thresholdFor(membership)}
                  actionLabel={actionLabelFor(membership)}
                  onAction={actionHandlerFor(membership)}
                  logoUrl={membership.program.merchant?.logo_url}
                />
              </div>
            ))}
        </div>
      </section>
      </main>
      <BottomNav />
    </>
  );
};

export default Dashboard;

