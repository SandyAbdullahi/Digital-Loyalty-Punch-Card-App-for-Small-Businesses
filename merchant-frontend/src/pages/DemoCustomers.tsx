import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

type CustomerProgram = {
  id: string
  name: string
  progress: number
  threshold: number
}

type CustomerRecord = {
  id: string
  name: string
  email: string
  avatar?: string
  totalStamps: number
  lastVisit: string | null
  programs: CustomerProgram[]
}

const DemoCustomers = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data
    const mockCustomers: CustomerRecord[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: null,
        totalStamps: 7,
        lastVisit: '2023-10-15T14:30:00',
        programs: [
          { id: '1', name: 'Coffee Rewards', progress: 7, threshold: 10 },
        ],
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: null,
        totalStamps: 3,
        lastVisit: '2023-10-14T09:15:00',
        programs: [
          { id: '2', name: 'Bakery Loyalty', progress: 3, threshold: 8 },
        ],
      },
      {
        id: '3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        avatar: null,
        totalStamps: 12,
        lastVisit: '2023-10-13T16:45:00',
        programs: [
          { id: '1', name: 'Coffee Rewards', progress: 5, threshold: 10 },
          { id: '2', name: 'Bakery Loyalty', progress: 7, threshold: 8 },
        ],
      },
    ]
    setCustomers(mockCustomers)
    setLoading(false)
  }, [])

  const filteredCustomers = useMemo(() => {
    if (!query) return customers
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [customers, query])

  const formatLastVisit = (dateString: string | null): string | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
                  Customers
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your loyalty program members
                </p>
              </div>
              <button
                onClick={() => navigate('/demo/qr')}
                className="btn-primary w-full sm:w-auto"
              >
                Generate QR
              </button>
            </header>

            <div className="rounded-3xl bg-card p-6 shadow-lg">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
                />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-muted p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted-foreground/20"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/4 rounded bg-muted-foreground/20"></div>
                          <div className="h-3 w-1/2 rounded bg-muted-foreground/20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`flex items-center gap-4 rounded-2xl p-4 transition-colors cursor-pointer ${
                        selectedCustomer?.id === customer.id
                          ? 'bg-muted/40 hover:bg-primary/50'
                          : 'bg-muted/40 hover:bg-primary/20'
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.totalStamps} stamps • Last visit: {formatLastVisit(customer.lastVisit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-lg">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{selectedCustomer.email}</p>
                  <div className="space-y-4">
                    {selectedCustomer.programs.map((program) => (
                      <div key={program.id} className="rounded-2xl bg-muted/40 p-4">
                        <h3 className="font-semibold text-foreground">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {program.progress} / {program.threshold} stamps
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(program.progress / program.threshold) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="mt-6 w-full btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DemoCustomers