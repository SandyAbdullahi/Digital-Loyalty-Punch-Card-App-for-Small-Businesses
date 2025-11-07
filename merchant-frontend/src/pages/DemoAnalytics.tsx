import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

type StampData = { day: string; stamps: number; redemptions: number }
type BarData = { day: string; customers: number }
type ProgramData = { name: string; value: number }

const stampsData: StampData[] = [
  { day: 'Mon', stamps: 42, redemptions: 12 },
  { day: 'Tue', stamps: 55, redemptions: 18 },
  { day: 'Wed', stamps: 60, redemptions: 20 },
  { day: 'Thu', stamps: 48, redemptions: 16 },
  { day: 'Fri', stamps: 75, redemptions: 28 },
  { day: 'Sat', stamps: 98, redemptions: 34 },
  { day: 'Sun', stamps: 65, redemptions: 21 },
]

const activeCustomersData: BarData[] = [
  { day: 'Mon', customers: 120 },
  { day: 'Tue', customers: 132 },
  { day: 'Wed', customers: 150 },
  { day: 'Thu', customers: 142 },
  { day: 'Fri', customers: 180 },
  { day: 'Sat', customers: 210 },
  { day: 'Sun', customers: 170 },
]

const programPerformance: ProgramData[] = [
  { name: 'Coffee Rewards', value: 34 },
  { name: 'Bakery Loyalty', value: 26 },
  { name: 'Diner Perks', value: 18 },
]

const DemoAnalytics = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
                  Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Insights into your loyalty program performance
                </p>
              </div>
              <button
                onClick={() => navigate('/demo')}
                className="btn-primary w-full sm:w-auto"
              >
                View Dashboard
              </button>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-card p-6 shadow-lg">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Stamps & Redemptions
                </h2>
                <div className="h-64 flex items-end justify-between gap-2">
                  {stampsData.map((item, index) => {
                    const max = Math.max(...stampsData.map(d => d.stamps))
                    const height = (item.stamps / max) * 200
                    return (
                      <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{item.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl bg-card p-6 shadow-lg">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Active Customers
                </h2>
                <div className="h-64 flex items-end justify-between gap-2">
                  {activeCustomersData.map((item, index) => {
                    const max = Math.max(...activeCustomersData.map(d => d.customers))
                    const height = (item.customers / max) * 200
                    return (
                      <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-full bg-secondary rounded-t"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{item.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-card p-6 shadow-lg">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                Program Performance
              </h2>
              <div className="space-y-4">
                {programPerformance.map((program) => (
                  <div key={program.name} className="flex items-center justify-between">
                    <span className="text-foreground">{program.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${program.value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{program.value}%</span>
                    </div>
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

export default DemoAnalytics