import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@rudi/ui'

type RewardStatus = 'claimed' | 'redeemed' | 'expired'

type RewardRecord = {
  id: string
  program: string
  customer: string
  date: string
  status: RewardStatus
}

const pillStyles: Record<RewardStatus, string> = {
  claimed: 'bg-rudi-yellow/20 text-rudi-yellow',
  redeemed: 'bg-rudi-teal/20 text-rudi-teal',
  expired: 'bg-rudi-coral/20 text-rudi-coral',
}

const Rewards = () => {
  const [rewards, setRewards] = useState<RewardRecord[]>([])

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get('/api/v1/merchants/rewards')
        if (Array.isArray(response.data)) {
          setRewards(
            response.data.map((reward: any) => ({
              id: reward.id ?? crypto.randomUUID(),
              program: reward.program ?? 'Program name',
              customer: reward.customer ?? 'Guest',
              date: reward.date
                ? new Date(reward.date).toLocaleString()
                : new Date().toLocaleString(),
              status: reward.status ?? 'claimed',
            }))
          )
        } else {
          throw new Error('Unexpected response')
        }
      } catch (error) {
        console.info('Using sample rewards data', error)
        setRewards([
          { id: '1', program: 'Morning Brew', customer: 'Maria Gomez', date: 'Today - 9:10 AM', status: 'claimed' },
          { id: '2', program: 'Lunch Club', customer: 'Kai Summers', date: 'Yesterday - 4:22 PM', status: 'redeemed' },
          { id: '3', program: 'Evening Treat', customer: 'Ola Adeniyi', date: 'Yesterday - 1:05 PM', status: 'expired' },
        ])
      }
    }
    fetchRewards()
  }, [])

  const markAsRedeemed = (id: string) => {
    setRewards((prev) =>
      prev.map((reward) =>
        reward.id === id ? { ...reward, status: 'redeemed', date: new Date().toLocaleString() } : reward
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Rewards</h1>
        <p className="text-sm text-rudi-maroon/70">
          Verify claims and celebrate every redemption.
        </p>
      </div>

      {rewards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-rudi-card">
          <div className="h-20 w-20 rounded-full bg-rudi-yellow/30" />
          <h3 className="font-heading text-lg text-rudi-maroon">No rewards yet today!</h3>
          <p className="text-sm text-rudi-maroon/70">
            Your next delighted guest is just around the corner.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-rudi-card">
          <div className="grid grid-cols-5 gap-4 border-b border-rudi-teal/15 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-rudi-maroon/60 max-sm:hidden">
            <span>Program</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-rudi-teal/10">
            {rewards.map((reward, index) => (
              <div
                key={reward.id}
                className="grid grid-cols-1 gap-4 px-6 py-5 text-sm text-rudi-maroon md:grid-cols-5 md:items-center animate-slide-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div>
                  <span className="font-semibold">{reward.program}</span>
                  <p className="md:hidden text-xs text-rudi-maroon/60">{reward.customer}</p>
                </div>
                <div className="hidden md:block">{reward.customer}</div>
                <div className="text-sm text-rudi-maroon/70">{reward.date}</div>
                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${pillStyles[reward.status]}`}>
                  {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                </span>
                <div className="flex justify-end">
                  {reward.status !== 'redeemed' ? (
                    <Button
                      className="btn-primary h-9 px-4"
                      type="button"
                      onClick={() => markAsRedeemed(reward.id)}
                    >
                      Mark as Redeemed
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-rudi-teal">Redeemed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Rewards
