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
    reward_description?: string;
    reward_threshold?: number;
    earn_rule?: {
      threshold?: number;
    } | null;
    redeem_rule?: {
      reward_threshold?: number;
      max_value?: number;
    } | null;
    stamp_icon?: string;
    merchant?: {
      name?: string;
      address?: string;
      last_visit?: string;
      display_name?: string;
      logo_url?: string;
    };
  };
};

type RedeemResponse = {
  code: string;
  expires_at: string;
  amount: string;
  status?: string;
  reward_description?: string;
  stamps_redeemed?: number;
};

type RedemptionHistoryItem = {
  id: string;
  code: string;
  status: 'claimed' | 'redeemed' | 'expired';
  amount: string;
  created_at: string;
  expires_at?: string;
  used_at?: string;
  reward_description?: string;
  stamps_redeemed?: number;
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
  const [redeemCode, setRedeemCode] = useState<RedeemResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<RedemptionHistoryItem[]>([]);
  const prevBalanceRef = useRef<number>(initialMembership?.current_balance ?? 0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshMembership = async (): Promise<Membership | null> => {
    if (!id) return null;
    const response = await axios.get<Membership[]>('/api/v1/customer/memberships');
    const updated = response.data.find((item) => item.program_id === id);
    if (updated) {
      setMembership(updated);
      return updated;
    }
    return null;
  };

  const fetchRedemptions = async () => {
    if (!id) return;
    try {
      const response = await axios.get<RedemptionHistoryItem[]>(`/api/v1/programs/${id}/redemptions`);
      setRedemptions(response.data);
      if (redeemCode) {
        const current = response.data.find((entry) => entry.code === redeemCode.code);
        if (current) {
          if (current.status === 'redeemed') {
            setShowConfetti(true);
            setRedeemCode(null);
            setTimeLeft(0);
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            await refreshMembership();
            setTimeout(() => navigate('/dashboard'), 800);
          } else if (current.status === 'expired') {
            setRedeemCode(null);
            setTimeLeft(0);
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load redemption history', err);
    }
  };

  useEffect(() => {
    if (!id) return;

    const initialise = async () => {
      try {
        if (!membership) {
          setLoading(true);
          const result = await refreshMembership();
          if (!result) {
            setError('Programme not found.');
            return;
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load this programme.');
      } finally {
        setLoading(false);
      }
      await fetchRedemptions();
    };

    initialise();
  }, [id]);

  useEffect(() => {
    if (membership && membership.current_balance > prevBalanceRef.current) {
      setShowConfetti(true);
    }
    prevBalanceRef.current = membership?.current_balance ?? 0;
  }, [membership?.current_balance]);

  useEffect(() => {
    if (!redeemCode) {
      setTimeLeft(0);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    const expiresAt = new Date(redeemCode.expires_at);
    const updateTime = () => {
      const now = Date.now();
      const diff = expiresAt.getTime() - now;
      setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0);
    };

    updateTime();
    const countdown = setInterval(updateTime, 1000);
    fetchRedemptions();
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
    pollRef.current = setInterval(fetchRedemptions, 4000);

    return () => {
      clearInterval(countdown);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [redeemCode]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--rudi-text)]/70">
        Loading programmeâ€¦
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

  // Parse earn_rule and redeem_rule if they are strings
  const earnRule = membership.program?.earn_rule;
  const parsedEarnRule = typeof earnRule === 'string' ? JSON.parse(earnRule) : earnRule;

  const redeemRule = membership.program?.redeem_rule;
  const parsedRedeemRule = typeof redeemRule === 'string' ? JSON.parse(redeemRule) : redeemRule;

  const rawThreshold =
    parsedEarnRule?.stamps_needed ??
    parsedRedeemRule?.reward_threshold ??
    parsedRedeemRule?.max_value ??
    10;
  const redeemAmount = Math.max(1, rawThreshold);
  const canRedeem = membership.current_balance >= redeemAmount;

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const response = await axios.post(`/api/v1/programs/${membership.program_id}/redeem`, {
        amount: redeemAmount, // Redeem full requirement
      });
      setRedeemCode(response.data);
      setShowConfetti(true);
      await refreshMembership();
      await fetchRedemptions();
    } catch (err: any) {
      console.error('Redeem failed:', err);
      // Could show error toast here
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
          â† Back
        </button>
        <article className="rudi-card p-6 space-y-4">
           <header>
             {membership.program?.merchant?.logo_url && (
               <img
                 src={membership.program.merchant.logo_url}
                 alt={`${membership.program.merchant.display_name ?? membership.program.merchant.name} logo`}
                 className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
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
                  {membership.current_balance}/{redeemAmount}
                </span>
              </div>
               <StampDots threshold={redeemAmount} earned={membership.current_balance} size="lg" icon={membership.program?.stamp_icon} />
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
               {canRedeem ? (redeeming ? 'Checkingâ€¦' : 'Redeem reward') : 'Keep earning'}
             </button>
            </div>
            {redeemCode && (
              <div className="rudi-card bg-rudi-yellow/10 border-rudi-yellow/30 p-4 space-y-3">
                <div className="text-center space-y-3">
                  <p className="font-semibold text-lg">Show this code to the barista</p>
                  <div className="bg-white rounded-lg p-4 font-mono text-2xl font-bold text-rudi-maroon border-2 border-rudi-yellow tracking-widest">
                    {redeemCode.code}
                  </div>
                  <p className="text-sm font-medium text-rudi-maroon">
                    Reward: {redeemCode.reward_description ?? membership.program?.reward_description ?? 'Special treat'}
                  </p>
                  <p className="text-xs text-rudi-maroon/70">
                    Stamps used: {redeemCode.stamps_redeemed ?? redeemAmount}
                  </p>
                  <p className="text-sm text-rudi-maroon/70">
                    {timeLeft > 0
                      ? `Expires in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                          .toString()
                          .padStart(2, '0')} â€” keep this screen open.`
                      : 'Waiting for the merchant to confirm your reward...'}
                  </p>
                </div>
                <div className="text-sm text-rudi-maroon/80 space-y-1 text-left">
                  <p className="font-semibold">What happens next?</p>
                  <p>The merchant will enter this code on their dashboard to release your reward.</p>
                  <p>Once confirmed, we&apos;ll whisk you back to your home feed automatically.</p>
                </div>
              </div>
            )}
            {canRedeem && !redeemCode && (
              <div className="text-sm text-[var(--rudi-text)]/80 space-y-2">
                <p className="font-semibold">How to redeem your reward:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap the "Redeem reward" button above.</li>
                  <li>Show this screen to a staff member at the merchant.</li>
                  <li>They will verify and provide your reward.</li>
                  <li>Your stamp card will reset for future rewards.</li>
                </ol>
                {membership.program?.reward_description && (
                  <p className="mt-2 italic">{membership.program.reward_description}</p>
                )}
              </div>
            )}
            {redemptions.length > 0 && (
              <details className="rudi-card bg-white/70 border border-[var(--rudi-text)]/10 p-4 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--rudi-text)]">
                  <span>Redemption history</span>
                  <span className="rounded-full bg-[var(--rudi-text)]/5 px-2 py-0.5 text-xs text-[var(--rudi-text)]/70">
                    {redemptions.length}
                  </span>
                </summary>
                <ul className="mt-3 space-y-3 text-sm text-[var(--rudi-text)]/80">
                  {redemptions.map((entry) => {
                    const created = new Date(entry.created_at).toLocaleString();
                    const statusLabel = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
                    const rewardLabel = entry.reward_description?.trim() || 'Reward';
                    const stampsLabel =
                      typeof entry.stamps_redeemed === 'number'
                        ? `Stamps used: ${entry.stamps_redeemed}`
                        : `Stamps used: ${entry.amount}`;
                    return (
                      <li
                        key={entry.id}
                        className="flex flex-col gap-1 rounded-xl border border-[var(--rudi-text)]/10 bg-white px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-[var(--rudi-text)]">
                            {statusLabel}
                          </span>
                          <span className="text-xs text-[var(--rudi-text)]/60">{created}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                          <span className="font-mono text-[var(--rudi-text)]/80">Code: {entry.code}</span>
                          <span>Reward: {rewardLabel}</span>
                          <span>{stampsLabel}</span>
                          {entry.status === 'redeemed' && entry.used_at && (
                            <span>Redeemed at {new Date(entry.used_at).toLocaleTimeString()}</span>
                          )}
                          {entry.status === 'claimed' && entry.expires_at && (
                            <span>Expires {new Date(entry.expires_at).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
        </article>
      </section>
    </main>
  );
};

export default ProgramDetail;




