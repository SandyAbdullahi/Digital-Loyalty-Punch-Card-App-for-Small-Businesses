import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@rudi/ui'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

type RewardStatus = 'claimed' | 'redeemed' | 'expired'

type RewardRecord = {
  id: string
  program: string
  customer: string
  date: string
  status: RewardStatus
  amount?: string
  code?: string
  expiresAt?: string
}

const pillStyles: Record<RewardStatus, string> = {
  claimed: 'bg-yellow-100 text-yellow-800',
  redeemed: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
}

const DemoRewards = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rewards, setRewards] = useState<RewardRecord[]>([])
  const [loadingCode, setLoadingCode] = useState<string | null>(null)

  useEffect(() => {
    // Mock data
    const mockRewards: RewardRecord[] = [
      {
        id: '1',
        program: 'Coffee Rewards',
        customer: 'Alice Johnson',
        date: '2023-10-15T10:30:00',
        status: 'claimed',
        amount: 'Free Coffee',
        code: 'ABC123',
        expiresAt: '2023-10-22T10:30:00',
      },
      {
        id: '2',
        program: 'Bakery Loyalty',
        customer: 'Bob Smith',
        date: '2023-10-14T14:15:00',
        status: 'redeemed',
        amount: 'Free Pastry',
      },
      {
        id: '3',
        program: 'Coffee Rewards',
        customer: 'Charlie Brown',
        date: '2023-10-13T09:45:00',
        status: 'expired',
        amount: 'Free Coffee',
        code: 'XYZ789',
      },
    ]
    setRewards(mockRewards)
  }, [])

  const redeemCode = async (code: string) => {
    // Mock redeem
    setLoadingCode(code)
    setTimeout(() => {
      setRewards(prev => prev.map(r => r.code === code ? { ...r, status: 'redeemed' as RewardStatus } : r))
      setLoadingCode(null)
    }, 1000)
  }

  const hasPending = useMemo(
    () => rewards.some((reward) => reward.status === 'claimed' && reward.code),
    [rewards]
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-60">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Rewards
                </h1>
                <p className="text-sm text-muted-foreground">
                  Verify codes, confirm redemptions, and celebrate every reward.
                </p>
              </div>
              <button
                onClick={() => navigate('/demo/qr')}
                className="btn-primary w-full sm:w-auto"
              >
                Generate QR
              </button>
            </header>

            {/* Pending Redeem Notifications */}
            {hasPending && (
              <div className="rounded-3xl bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  🔔 Pending Redeem Requests
                </h2>
                <div className="space-y-3">
                  {rewards.filter(r => r.status === 'claimed' && r.code).map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {reward.customer} wants to redeem {reward.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Program: {reward.program}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Code: {reward.code}
                        </p>
                      </div>
                      <Button
                        onClick={() => redeemCode(reward.code!)}
                        disabled={loadingCode === reward.code}
                        className="btn-primary"
                      >
                        {loadingCode === reward.code ? 'Redeeming...' : 'Redeem'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-card p-6 shadow-lg">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                Reward History
              </h2>
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{reward.customer}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pillStyles[reward.status]}`}>
                          {reward.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reward.program} • {reward.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reward.date).toLocaleDateString()}
                        {reward.code && ` • Code: ${reward.code}`}
                        {reward.expiresAt && ` • Expires: ${new Date(reward.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {reward.status === 'claimed' && reward.code && (
                      <Button
                        onClick={() => redeemCode(reward.code!)}
                        disabled={loadingCode === reward.code}
                        variant="outline"
                        size="sm"
                      >
                        {loadingCode === reward.code ? 'Redeeming...' : 'Redeem'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DemoRewards