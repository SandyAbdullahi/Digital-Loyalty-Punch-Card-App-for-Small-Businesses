import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from '@rudi/ui';

type RewardStatus = 'claimed' | 'redeemed' | 'expired';

type RewardRecord = {
  id: string;
  program: string;
  customer: string;
  date: string;
  status: RewardStatus;
  amount?: string;
  code?: string;
  expiresAt?: string;
};

const pillStyles: Record<RewardStatus, string> = {
  claimed: 'bg-rudi-yellow/20 text-rudi-yellow',
  redeemed: 'bg-rudi-teal/20 text-rudi-teal',
  expired: 'bg-rudi-coral/20 text-rudi-coral',
};

const Rewards = () => {
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/api/v1/merchants/rewards');
      if (Array.isArray(response.data)) {
        setRewards(
          response.data.map((reward: any) => ({
            id: reward.id ?? crypto.randomUUID(),
            program: reward.program ?? 'Program name',
            customer: reward.customer ?? 'Guest',
            date: reward.date ?? new Date().toLocaleString(),
            status: (reward.status ?? 'claimed') as RewardStatus,
            amount: reward.amount,
            code: reward.code ?? undefined,
            expiresAt: reward.expires_at ?? undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch rewards', error);
      setRewards([]);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const redeemCode = async (code: string) => {
    try {
      setLoadingCode(code);
      await axios.post('/api/v1/merchants/redeem-code', { code });
      await fetchRewards();
    } catch (error) {
      console.error('Failed to redeem code:', error);
    } finally {
      setLoadingCode(null);
    }
  };

  const hasPending = useMemo(
    () => rewards.some((reward) => reward.status === 'claimed' && reward.code),
    [rewards]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Rewards</h1>
        <p className="text-sm text-rudi-maroon/70">
          Verify codes, confirm redemptions, and celebrate every reward.
        </p>
      </div>

      {rewards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-rudi-card">
          <div className="h-20 w-20 rounded-full bg-rudi-yellow/30" />
          <h3 className="font-heading text-lg text-rudi-maroon">No rewards yet!</h3>
          <p className="text-sm text-rudi-maroon/70">
            Pending redemptions and completed rewards will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-rudi-card">
          <div className="grid grid-cols-6 gap-4 border-b border-rudi-teal/15 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-rudi-maroon/60 max-sm:hidden">
            <span>Program</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span>{hasPending ? 'Verify' : 'Actions'}</span>
          </div>
          <div className="divide-y divide-rudi-teal/10">
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className="grid grid-cols-1 gap-4 px-6 py-5 text-sm text-rudi-maroon md:grid-cols-6 md:items-center animate-slide-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div>
                  <span className="font-semibold">{reward.program}</span>
                  <p className="md:hidden text-xs text-rudi-maroon/60">{reward.customer}</p>
                  {reward.code && (
                    <p className="md:hidden font-mono text-xs text-rudi-maroon/70">
                      Code: {reward.code}
                    </p>
                  )}
                </div>
                <div className="hidden md:block">{reward.customer}</div>
                <div className="text-sm text-rudi-maroon/70">{reward.date}</div>
                <div className="font-semibold">{reward.amount || '1'}</div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${pillStyles[reward.status]}`}
                >
                  {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                </span>
                <div className="flex flex-col items-end gap-2 text-right">
                  {reward.status === 'claimed' && reward.code ? (
                    <>
                      <span className="font-mono text-xs text-rudi-maroon/80">
                        Code: {reward.code}
                      </span>
                      {reward.expiresAt && (
                        <span className="text-[11px] text-rudi-maroon/60">
                          Expires at: {new Date(reward.expiresAt).toLocaleTimeString()}
                        </span>
                      )}
                      <Button
                        className="btn-primary h-8 px-3 text-xs"
                        type="button"
                        onClick={() => redeemCode(reward.code!)}
                        disabled={loadingCode === reward.code}
                      >
                        {loadingCode === reward.code ? 'Confirming…' : 'Mark redeemed'}
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-rudi-teal">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;

