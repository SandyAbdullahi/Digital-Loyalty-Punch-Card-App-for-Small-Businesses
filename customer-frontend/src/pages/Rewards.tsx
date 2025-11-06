import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BottomNav } from '../components/BottomNav';
import { formatApiDate } from '../utils/date';

type RewardStatus = 'claimed' | 'redeemed' | 'expired';

type RewardRecord = {
  id: string;
  code: string;
  status: RewardStatus;
  amount: string;
  created_at: string;
  expires_at?: string;
  used_at?: string;
  program_name?: string;
  merchant_name?: string;
  reward_description?: string;
  stamps_redeemed?: number;
};

const statusStyles: Record<RewardStatus, string> = {
  claimed: 'bg-[var(--rudi-yellow)]/15 text-[var(--rudi-yellow)]',
  redeemed: 'bg-[var(--rudi-primary)]/15 text-[var(--rudi-primary)]',
  expired: 'bg-[var(--rudi-accent)]/15 text-[var(--rudi-accent)]',
};

const statusLabel: Record<RewardStatus, string> = {
  claimed: 'Pending',
  redeemed: 'Redeemed',
  expired: 'Expired',
};

const Rewards = () => {
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get<RewardRecord[]>('/api/v1/customer/rewards');
        setRewards(response.data ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? '');
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const grouped = useMemo(() => ({
    claimed: rewards.filter((reward) => reward.status === 'claimed'),
    redeemed: rewards.filter((reward) => reward.status === 'redeemed'),
    expired: rewards.filter((reward) => reward.status === 'expired'),
  }), [rewards]);

  const renderReward = (reward: RewardRecord) => {
    const issuedOn = formatApiDate(reward.created_at, undefined, '');
    const expiresOn = formatApiDate(reward.expires_at, undefined, '');
    const usedOn = formatApiDate(reward.used_at, undefined, '');
    const rewardLabel = reward.reward_description?.trim() || reward.program_name || 'Reward';
    const merchantLabel = reward.merchant_name ?? 'Merchant';
    const issuedLabel = issuedOn ? `${merchantLabel}: ${issuedOn}` : merchantLabel;
    const stampsLabel =
      typeof reward.stamps_redeemed === 'number'
        ? `Stamps used: ${reward.stamps_redeemed}`
        : `Stamps used: ${reward.amount}`;

    return (
      <article key={reward.id} className="rudi-card p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold">
              {reward.program_name ?? 'Programme reward'}
            </h3>
            <p className="text-xs text-[var(--rudi-text)]/60">{issuedLabel}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[reward.status]}`}>
            {statusLabel[reward.status]}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--rudi-text)]/80">
          <span className="font-mono text-[var(--rudi-text)]">
            Code: {reward.code}
          </span>
          <span>Reward: {rewardLabel}</span>
          <span>{stampsLabel}</span>
          {reward.status === 'claimed' && expiresOn && (
            <span>Expires {expiresOn}</span>
          )}
          {reward.status === 'redeemed' && usedOn && (
            <span>Redeemed {usedOn}</span>
          )}
        </div>
      </article>
    );
  };

  const renderSection = (title: string, items: RewardRecord[]) => {
    if (items.length === 0) return null;

    return (
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[var(--rudi-text)]">{title}</h2>
          <span className="text-xs text-[var(--rudi-text)]/60">{items.length} total</span>
        </header>
        <div className="space-y-3">
          {items.map(renderReward)}
        </div>
      </section>
    );
  };

  const hasAnyRewards = rewards.length > 0;

  return (
    <main className="min-h-screen bg-[var(--rudi-background)] text-[var(--rudi-text)] pb-16">
      <header className="px-4 pt-10 pb-6 space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Rewards</h1>
        <p className="text-sm text-[var(--rudi-text)]/70">
          See every perk you have unlocked and anything still waiting to be claimed.
        </p>
      </header>
      <section className="px-4 space-y-6 mb-16">
        {loading && <p className="text-sm text-[var(--rudi-text)]/70">Loading rewards...</p>}
        {error && !loading && (
          <p className="text-sm text-[var(--rudi-accent)] bg-[var(--rudi-accent)]/10 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {!loading && !hasAnyRewards && (
          <div className="rudi-card p-6 text-center space-y-3">
            <div className="text-4xl" aria-hidden="true">
              *
            </div>
            <h2 className="font-heading text-lg font-semibold">No rewards yet</h2>
            <p className="text-sm text-[var(--rudi-text)]/70">
              Join a local shop to start earning stamps and unlock something delightful.
            </p>
          </div>
        )}

        {renderSection('Awaiting pickup', grouped.claimed)}
        {renderSection('Redeemed', grouped.redeemed)}
        {renderSection('Expired', grouped.expired)}
      </section>
      <BottomNav />
    </main>
  );
};

export default Rewards;

