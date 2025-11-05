import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StampDots from '../components/StampDots';
import ConfettiOverlay from '../components/ConfettiOverlay';

type Membership = {
  id: string;
  program_id: string;
  current_balance: number;
  program?: {
    id: string;
    name?: string;
    description?: string;
    reward_threshold?: number;
    reward_description?: string;
    stamp_icon?: string;
    merchant?: {
      name?: string;
      address?: string;
      last_visit?: string;
    };
  };
};

const ProgramDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialMembership = location.state?.membership as Membership | undefined;

  const [membership, setMembership] = useState<Membership | null>(initialMembership ?? null);
  const [loading, setLoading] = useState(!initialMembership);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const prevBalanceRef = useRef<number>(initialMembership?.current_balance ?? 0);

  useEffect(() => {
    if (membership || !id) return;

    const fetchMembership = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Membership[]>('/api/v1/customer/memberships');
        const found = response.data.find((item) => item.program_id === id);
        if (!found) {
          setError('Programme not found.');
        } else {
          setMembership(found);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load this programme.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [id, membership]);

  useEffect(() => {
    if (membership && membership.current_balance > prevBalanceRef.current) {
      setShowConfetti(true);
    }
    prevBalanceRef.current = membership?.current_balance ?? 0;
  }, [membership?.current_balance]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--rudi-text)]/70">
        Loading programme…
      </main>
    );
  }

  if (error || !membership) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="rudi-card p-6 text-center space-y-3">
          <p className="text-sm text-rudi-coral">{error || 'Programme not found.'}</p>
          <button
            type="button"
            className="rudi-btn rudi-btn--primary w-full"
            onClick={() => navigate('/dashboard')}
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  const threshold = membership.program?.reward_threshold ?? 10;
  const canRedeem = membership.current_balance >= threshold;

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      await axios.post('/api/v1/customer/redeem', {
        program_id: membership.program_id,
      });
      setShowConfetti(true);
    } catch (err) {
      // Gracefully ignore errors for now; API may not exist yet.
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--rudi-background)] text-[var(--rudi-text)] pb-24">
      <ConfettiOverlay visible={showConfetti} onComplete={() => setShowConfetti(false)} />
      <section className="px-4 pt-10 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rudi-link text-sm inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <article className="rudi-card p-6 space-y-4">
           <header>
             {membership.program?.merchant?.logo_url && (
               <img
                 src={membership.program.merchant.logo_url}
                 alt={`${membership.program.merchant.display_name ?? membership.program.merchant.name} logo`}
                 className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
               />
             )}
             <h1 className="font-heading text-2xl font-semibold">
               {membership.program?.merchant?.display_name ?? membership.program?.merchant?.name ?? 'Unknown Merchant'}
             </h1>
             <p className="text-sm text-[var(--rudi-text)]/75 mt-2">
               {membership.program?.description ??
                 'Collect stamps each visit and redeem your reward once you complete the punch card.'}
             </p>
             {membership.program?.merchant?.address && (
               <p className="text-sm text-[var(--rudi-text)]/70 mt-1">{membership.program.merchant.address}</p>
             )}
           </header>
           <div className="space-y-3">
            <div className="rudi-card bg-[var(--rudi-background)]/60 shadow-none border border-[var(--rudi-text)]/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Your progress</span>
                <span className="text-sm text-[var(--rudi-text)]/70">
                  {membership.current_balance}/{threshold}
                </span>
              </div>
               <StampDots threshold={threshold} earned={membership.current_balance} size="lg" icon={membership.program?.stamp_icon} />
            </div>
          </div>
           <div className="grid gap-3 sm:grid-cols-2">
             {!canRedeem && (
               <button
                 type="button"
                 className="rudi-btn rudi-btn--primary w-full"
                 onClick={() => navigate('/scan')}
               >
                 Add stamp
               </button>
             )}
             <button
               type="button"
               className="rudi-btn w-full border border-rudi-teal text-rudi-teal bg-transparent disabled:opacity-60"
               onClick={handleRedeem}
               disabled={!canRedeem || redeeming}
             >
               {canRedeem ? (redeeming ? 'Checking…' : 'Redeem reward') : 'Keep earning'}
             </button>
           </div>
          {canRedeem && (
            <p className="text-sm text-[var(--rudi-text)]/80">
              {membership.program?.reward_description ?? 'Show this screen to staff to confirm your reward.'}
            </p>
          )}
        </article>
      </section>
    </main>
  );
};

export default ProgramDetail;
