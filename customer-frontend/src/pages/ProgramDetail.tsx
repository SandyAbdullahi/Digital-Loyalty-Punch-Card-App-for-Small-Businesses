import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';
import StampDots from '../components/StampDots';
import ConfettiOverlay from '../components/ConfettiOverlay';
import CustomerCard, { CustomerRewardStatus } from '../components/CustomerCard';
import {
  ArrowNarrowLeft,
  ArrowNarrowRight,
  Clock,
  Gift01,
  ShieldTick,
} from '@untitled-ui/icons-react';
import { formatApiDate, parseApiDate } from '../utils/date';
import { useWebSocket } from '../contexts/WebSocketContext';

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
    stamps_required?: number;
    logic_type?: string;
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
      legal_name?: string;
      id?: string;
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
  id?: string;
  program_name?: string;
  merchant_name?: string;
  created_at?: string;
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

type RewardState = {
  reward: {
    id: string;
    status: CustomerRewardStatus;
    voucher_code?: string | null;
    redeem_expires_at?: string | null;
    reached_at?: string | null;
  };
  stamps_in_cycle: number;
  stamps_required: number;
};

const ProgramDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialMembership = location.state?.membership as
    | Membership
    | undefined;

  const [membership, setMembership] = useState<Membership | null>(
    initialMembership ?? null
  );
  const [loading, setLoading] = useState(!initialMembership);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemCode, setRedeemCode] = useState<RedeemResponse | null>(null);
  const [redeemQrCode, setRedeemQrCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<RedemptionHistoryItem[]>([]);
  const { lastMessage } = useWebSocket();
  const [rewardState, setRewardState] = useState<RewardState | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const prevBalanceRef = useRef<number>(
    initialMembership?.current_balance ?? 0
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRewardState = useCallback(async (enrollmentId: string) => {
    try {
      setRewardLoading(true);
      setRewardError(null);
      const response = await axios.get<RewardState>(
        `/api/v1/enrollments/${enrollmentId}/reward`
      );
      setRewardState(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRewardState(null);
      } else {
        console.error('Failed to fetch reward state', err);
        setRewardError('Unable to load reward status right now.');
      }
    } finally {
      setRewardLoading(false);
    }
  }, []);

  const refreshMembership = useCallback(async (): Promise<Membership | null> => {
    if (!id) return null;
    const response = await axios.get<Membership[]>(
      '/api/v1/customer/memberships'
    );
    const updated = response.data.find((item) => item.program_id === id);
    if (updated) {
      setMembership(updated);
      void fetchRewardState(updated.id);
      return updated;
    }
    return null;
  }, [id, fetchRewardState]);

  const fetchRedemptions = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axios.get<RedemptionHistoryItem[]>(
        `/api/v1/programs/${id}/redemptions`
      );
      setRedemptions(response.data);
      if (redeemCode) {
        const current = response.data.find(
          (entry) => entry.code === redeemCode.code
        );
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
  }, [id, redeemCode, refreshMembership, navigate]);

  useEffect(() => {
    if (membership?.id) {
      void fetchRewardState(membership.id);
    }
  }, [membership?.id, fetchRewardState]);

  const membershipProgramId = membership?.program_id;

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return;
    if ((lastMessage as { type?: string }).type !== 'reward_status') return;
    if (!membershipProgramId) return;
    const payload = lastMessage as Record<string, any>;
    const { program_id: programId, status } = payload;
    if (!programId || programId !== membershipProgramId) return;

    const handleRewardStatus = async () => {
      await refreshMembership();
      await fetchRedemptions();

      if (typeof status === 'string' && status.toLowerCase() === 'redeemed') {
        setShowConfetti(true);
        setRedeemCode(null);
        setTimeLeft(0);
        setRedeemQrCode('');
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setTimeout(
          () =>
            navigate('/dashboard', {
              replace: true,
              state: {
                rewardRedeemed: true,
                rewardProgramName: membership?.program?.name,
              },
            }),
          600
        );
      }
    };

    void handleRewardStatus();
  }, [lastMessage, membershipProgramId, refreshMembership, fetchRedemptions, navigate]);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return;
    if ((lastMessage as { type?: string }).type !== 'membership_left') return;
    const { program_id, membership_id } = lastMessage as Record<string, any>;
    if (
      membership &&
      ((membership_id && membership_id === membership.id) ||
        (program_id && program_id === membership.program_id))
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, [lastMessage, membership, navigate]);

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
        setError(
          err?.response?.data?.detail ?? 'Unable to load this programme.'
        );
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
      setRedeemQrCode('');
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // Generate QR code for the redeem code
    QRCode.toDataURL(redeemCode.code, { width: 200, margin: 2 })
      .then(setRedeemQrCode)
      .catch(console.error);

    const expiresAt = parseApiDate(redeemCode.expires_at);
    if (!expiresAt) {
      setTimeLeft(0);
      return;
    }
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
        Loading programme...
      </main>
    );
  }

  if (error || !membership) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="rudi-card p-6 text-center space-y-3">
          <p className="text-sm text-rudi-coral">
            {error || 'Programme not found.'}
          </p>
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
  const parsedEarnRule =
    typeof earnRule === 'string' ? JSON.parse(earnRule) : earnRule;

  const redeemRule = membership.program?.redeem_rule;
  const parsedRedeemRule =
    typeof redeemRule === 'string' ? JSON.parse(redeemRule) : redeemRule;

  const rawThreshold =
    membership.program?.stamps_required ??
    parsedRedeemRule?.stamps_needed ??
    parsedRedeemRule?.threshold ??
    parsedRedeemRule?.reward_threshold ??
    parsedRedeemRule?.max_value ??
    parsedEarnRule?.stamps_needed ??
    parsedEarnRule?.threshold ??
    membership.program?.reward_threshold ??
    10;
  const isPointsProgram = membership.program?.logic_type === 'points';
  const isPunchCardProgram = !isPointsProgram;
  const maxRedeemAmount = isPointsProgram ? membership.current_balance : Math.max(1, rawThreshold);
  const [customRedeemAmount, setCustomRedeemAmount] = useState(maxRedeemAmount);
  const redeemAmount = isPointsProgram ? customRedeemAmount : maxRedeemAmount;
  const canRedeem = isPointsProgram
    ? membership.current_balance >= redeemAmount && redeemAmount > 0
    : rewardState?.reward.status === 'redeemable';
  const merchant = membership.program?.merchant;
  const merchantDisplayName =
    merchant?.display_name ?? merchant?.legal_name ?? merchant?.id ?? 'Unknown Merchant';
  const merchantAddress = merchant?.address;
  const merchantLogo = merchant?.logo_url;

  const handleRedeem = async () => {
    if (isPunchCardProgram) {
      const reward = rewardState?.reward;
      if (!reward || reward.status !== 'redeemable' || !reward.voucher_code) {
        alert('Reward not yet ready to redeem.');
        return;
      }
      try {
        await axios.post(`/api/v1/rewards/${reward.id}/request`);
      } catch (notifyError) {
        console.error('Failed to notify merchant about redeem request:', notifyError);
      }

      setRedeemCode({
        code: reward.voucher_code,
        expires_at: reward.redeem_expires_at ?? '',
        amount: String(rewardState?.stamps_required ?? redeemAmount),
        reward_description: membership.program?.reward_description ?? membership.program?.name ?? 'Reward',
        stamps_redeemed: rewardState?.stamps_required ?? redeemAmount,
        status: 'claimed',
        id: reward.id,
        program_name: membership.program?.name,
        merchant_name: membership.program?.merchant?.display_name,
        created_at: reward.reached_at ?? new Date().toISOString(),
      });
      setShowConfetti(true);
      return;
    }

    setRedeeming(true);
    try {
      const response = await axios.post(
        `/api/v1/programs/${membership.program_id}/redeem`,
        {
          amount: redeemAmount,
        }
      );
      setRedeemCode(response.data);
      setShowConfetti(true);
      await refreshMembership();
      await fetchRedemptions();
    } catch (err: any) {
      console.error('Redeem failed:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Unknown error';
      alert(`Redeem failed: ${errorMessage}`);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--rudi-background)] text-[var(--rudi-text)] pb-24">
      <ConfettiOverlay
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <section className="px-4 pt-10 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rudi-link text-sm inline-flex items-center gap-2 font-semibold"
          aria-label="Back to previous screen"
        >
          <ArrowNarrowLeft className="h-4 w-4" />
          Back
        </button>

        <article className="rudi-card p-6 space-y-4">
          <header className="text-center space-y-2">
            {merchantLogo && (
              <img
                src={merchantLogo}
                alt={`${merchantDisplayName} logo`}
                className="w-28 h-28 rounded-full object-cover mx-auto mb-2"
              />
            )}
            <h1 className="font-heading text-2xl font-semibold">
              {merchantDisplayName}
            </h1>
            <p className="text-sm text-[var(--rudi-text)]/75">
              {membership.program?.description ??
                'Collect stamps each visit and redeem your reward once you complete the punch card.'}
            </p>
            {merchantAddress && (
              <p className="text-sm text-[var(--rudi-text)]/70">
                {merchantAddress}
              </p>
            )}
          </header>
          <div className="space-y-3">
             <div className="rudi-card bg-[var(--rudi-background)]/60 shadow-none border border-[var(--rudi-text)]/10 p-4 space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-semibold">Your progress</span>
                 <span className="text-sm text-[var(--rudi-text)]/70">
                   {membership.current_balance}{isPointsProgram ? '' : `/${redeemAmount}`}
                 </span>
               </div>
               {isPointsProgram ? (
                 <div className="text-center">
                   <div className="text-2xl font-bold text-[var(--rudi-primary)]">
                     {membership.current_balance} points
                   </div>
                   <p className="text-sm text-[var(--rudi-text)]/70">Available to redeem</p>
                 </div>
               ) : (
                  <StampDots
                    threshold={redeemAmount}
                    earned={membership.current_balance}
                    size="lg"
                    icon={membership.program?.stamp_icon}
                  />
                )}
              </div>
              {rewardLoading && (
                <div className="rounded-2xl border border-dashed border-[var(--rudi-text)]/20 bg-white/60 p-4 text-center text-sm text-[var(--rudi-text)]/70">
                  Syncing reward status...
                </div>
              )}
              {rewardError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {rewardError}
                </div>
              )}
              {rewardState && (
                <CustomerCard
                  programName={membership.program?.name ?? 'Loyalty reward'}
                  stampsRequired={
                    rewardState.stamps_required ??
                    membership.program?.stamps_required ??
                    redeemAmount
                  }
                  stampsInCycle={rewardState.stamps_in_cycle}
                  status={rewardState.reward.status}
                  voucherCode={rewardState.reward.voucher_code ?? undefined}
                  redeemExpiresAt={rewardState.reward.redeem_expires_at ?? undefined}
                />
              )}
              {isPointsProgram && canRedeem && (
                <div className="rudi-card bg-[var(--rudi-background)]/60 shadow-none border border-[var(--rudi-text)]/10 p-4 space-y-3">
                  <label className="text-sm font-semibold">Redeem amount</label>
                  <input
                   type="number"
                   min="1"
                   max={membership.current_balance}
                   value={customRedeemAmount}
                   onChange={(e) => setCustomRedeemAmount(Math.min(membership.current_balance, Math.max(1, parseInt(e.target.value) || 1)))}
                   className="w-full rounded-2xl border border-[var(--rudi-text)]/20 bg-white px-4 py-3 text-sm focus:border-[var(--rudi-primary)] focus:outline-none"
                 />
                 <p className="text-xs text-[var(--rudi-text)]/70">
                   Choose how many points to redeem (1-{membership.current_balance})
                 </p>
               </div>
             )}
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
              {canRedeem
                ? redeeming
                  ? 'Checking...'
                  : isPointsProgram
                    ? `Redeem ${redeemAmount} points`
                    : 'Redeem reward'
                : 'Keep earning'}
            </button>
          </div>
          {redeemCode && (
            <div className="rounded-3xl bg-gradient-to-br from-[#FFF4D9] via-[#FFF9EE] to-white border border-[#FFE3A4] p-5 space-y-4 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                    <Gift01 className="h-6 w-6 text-[#C47F00]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#AD7B00]">
                      Reward ready
                    </p>
                    <p className="font-heading text-lg font-semibold text-[#2F1B00]">
                      {redeemCode.reward_description ??
                        membership.program?.reward_description ??
                        'Surprise treat'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-right text-[#2F1B00] space-y-1">
                  <p className="font-semibold">
                    Stamps used: {redeemCode.stamps_redeemed ?? redeemAmount}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#C47F00]">
                    Active code
                  </span>
                </div>
              </div>

               <div className="rounded-2xl bg-white/90 border border-[#FFE5B3] p-4 space-y-3">
                 <p className="text-xs font-semibold uppercase tracking-wide text-[#987000]">
                   Redeem code
                 </p>
                 {redeemQrCode && (
                   <div className="flex justify-center">
                     <img
                       src={redeemQrCode}
                       alt="Redeem QR Code"
                       className="w-32 h-32 rounded-lg border border-[#FFE5B3]"
                     />
                   </div>
                 )}
                 <div className="bg-[#FFF9ED] border border-[#FFE5B3] rounded-2xl px-4 py-4 font-mono text-xl sm:text-3xl font-bold tracking-[0.35em] text-[#2F1B00] text-center break-all">
                   {redeemCode.code}
                 </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4E1F]">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {timeLeft > 0
                      ? `Expires in ${Math.floor(timeLeft / 60)}:${(
                          timeLeft % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : 'Awaiting merchant confirmation'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldTick className="h-4 w-4" />
                    Keep this screen visible for staff verification.
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 border border-white/60 p-4 space-y-3">
                <p className="text-sm font-semibold text-[#2F1B00]">
                  What happens next
                </p>
                <ol className="space-y-2 text-sm text-[#5A3C0C]">
                  <li className="flex items-start gap-2">
                    <ArrowNarrowRight className="mt-[2px] h-4 w-4 text-[#C47F00]" />
                    Show this code to the merchant so they can mark it as
                    redeemed.
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldTick className="mt-[2px] h-4 w-4 text-[#00A47A]" />
                    We will refresh your stamps and redirect you home once they
                    confirm it.
                  </li>
                </ol>
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
                <p className="mt-2 italic">
                  {membership.program.reward_description}
                </p>
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
                  const created = formatApiDate(entry.created_at, undefined, '—');
                  const statusLabel =
                    entry.status.charAt(0).toUpperCase() +
                    entry.status.slice(1);
                  const rewardLabel =
                    entry.reward_description?.trim() || 'Reward';
                  const stampsLabel =
                    typeof entry.stamps_redeemed === 'number'
                      ? `Stamps used: ${entry.stamps_redeemed}`
                      : `Stamps used: ${entry.amount}`;
                  const redeemedAt = formatApiDate(entry.used_at, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const expiresAt = formatApiDate(entry.expires_at, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-1 rounded-xl border border-[var(--rudi-text)]/10 bg-white px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[var(--rudi-text)]">
                          {statusLabel}
                        </span>
                        <span className="text-xs text-[var(--rudi-text)]/60">
                          {created}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                        <span className="font-mono text-[var(--rudi-text)]/80">
                          Code: {entry.code}
                        </span>
                        <span>Reward: {rewardLabel}</span>
                        <span>{stampsLabel}</span>
                        {entry.status === 'redeemed' && redeemedAt && (
                          <span>Redeemed at {redeemedAt}</span>
                        )}
                        {entry.status === 'claimed' && expiresAt && (
                          <span>Expires {expiresAt}</span>
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
