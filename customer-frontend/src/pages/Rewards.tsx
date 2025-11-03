import { useEffect, useState } from 'react';
import axios from 'axios';
import { BottomNav } from '../components/BottomNav';

type Reward = {
  id: string;
  title: string;
  redeemed_at: string;
  status?: 'claimed' | 'saved';
  merchant_name?: string;
};

const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get<Reward[]>('/api/v1/customer/rewards');
        setRewards(response.data);
      } catch (err: any) {
        // Silently fall back to empty state if endpoint not ready yet
        setError(err?.response?.data?.detail ?? '');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  return (
    <main className="min-h-screen bg-rudi-sand text-rudi-maroon pb-16">
      <header className="px-4 pt-10 pb-6 space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Rewards</h1>
        <p className="text-sm text-rudi-maroon/70">Track the perks you’ve earned from your favourite merchants.</p>
      </header>
      <section className="px-4 space-y-4">
        {loading && <p className="text-sm text-rudi-maroon/70">Loading rewards…</p>}
        {error && (
          <p className="text-sm text-rudi-coral bg-rudi-coral/10 px-3 py-2 rounded-md">
            We’ll show your rewards here once available.
          </p>
        )}
        {!loading && rewards.length === 0 && (
          <div className="rudi-card p-6 text-center space-y-3">
            <div className="text-4xl" aria-hidden="true">
              🌱
            </div>
            <h2 className="font-heading text-lg font-semibold">No rewards yet</h2>
            <p className="text-sm text-rudi-maroon/70">
              Join a local shop to start earning stamps and unlock something delightful.
            </p>
          </div>
        )}
        {rewards.map((reward) => (
          <article key={reward.id} className="rudi-card p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-rudi-teal/10 text-rudi-teal flex items-center justify-center text-xl">
              🎁
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold">{reward.title}</h3>
              <p className="text-xs text-rudi-maroon/60">
                Redeemed {new Date(reward.redeemed_at).toLocaleDateString()} •{' '}
                {reward.merchant_name ?? 'Merchant reward'}
              </p>
            </div>
            <span className="text-xs font-semibold uppercase text-rudi-teal">
              {reward.status === 'claimed' ? 'Claimed' : 'Saved'}
            </span>
          </article>
        ))}
      </section>
      <BottomNav />
    </main>
  );
};

export default Rewards;
