import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@rudi/ui'

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
  lastVisit: string
  programs: CustomerProgram[]
}

const seedCustomers: CustomerRecord[] = [
  {
    id: '1',
    name: 'Maria Gomez',
    email: 'maria@gomez.com',
    totalStamps: 28,
    lastVisit: '2 hours ago',
    programs: [
      { id: 'p1', name: 'Morning Brew', progress: 7, threshold: 10 },
      { id: 'p2', name: 'Lunch Club', progress: 3, threshold: 8 },
    ],
  },
  {
    id: '2',
    name: 'Kai Summers',
    email: 'kai@summers.com',
    totalStamps: 41,
    lastVisit: 'Yesterday',
    programs: [{ id: 'p3', name: 'VIP Latte', progress: 9, threshold: 12 }],
  },
  {
    id: '3',
    name: 'Ola Adeniyi',
    email: 'ola@adeniyi.co',
    totalStamps: 12,
    lastVisit: '3 days ago',
    programs: [{ id: 'p4', name: 'Pastry Lovers', progress: 4, threshold: 6 }],
  },
]

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(seedCustomers)
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/v1/merchants/customers')
        if (Array.isArray(response.data)) {
          setCustomers(
            response.data.map((item: any) => ({
              id: item.id ?? crypto.randomUUID(),
              name: item.name ?? item.email ?? 'Valued Guest',
              email: item.email ?? 'unknown',
              totalStamps: item.total_stamps ?? 0,
              lastVisit: item.last_visit ?? 'Just now',
              programs: (item.programs ?? []).map((program: any) => ({
                id: program.id ?? crypto.randomUUID(),
                name: program.name ?? 'Program',
                progress: program.progress ?? 0,
                threshold: program.threshold ?? 10,
              })),
            }))
          )
        }
      } catch (error) {
        console.info('Falling back to in-memory customers.', error)
      }
    }
    fetchCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    if (!query) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [customers, query])

  const showToast = (type: 'success' | 'info', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2400)
  }

  const handleManualAction = (action: 'add' | 'revoke') => {
    if (action === 'add') {
      showToast('success', 'Stamp added - let the celebration begin!')
    } else {
      showToast('info', 'Stamp revoked - balance back in harmony.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-rudi-maroon">Customers</h1>
        <p className="text-sm text-rudi-maroon/70">
          Search your community of explorers and celebrate their loyalty.
        </p>
      </div>

      <div className="flex justify-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="h-12 w-full max-w-lg rounded-full border-rudi-teal/20 bg-white px-5 shadow-md"
        />
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            className="card-hover flex items-center justify-between gap-4 rounded-3xl bg-white px-5 py-4 shadow-rudi-card animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rudi-teal/10 font-heading text-lg font-semibold text-rudi-teal">
                {customer.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-base font-semibold text-rudi-maroon">{customer.name}</p>
                <p className="text-sm text-rudi-maroon/60">{customer.email}</p>
              </div>
            </div>
            <div className="hidden flex-col text-right text-sm text-rudi-maroon/70 sm:flex">
              <span>
                Total stamps:{' '}
                <strong className="text-rudi-maroon">{customer.totalStamps}</strong>
              </span>
              <span>Last visit: {customer.lastVisit}</span>
            </div>
            <Button className="btn-secondary" type="button" onClick={() => setSelectedCustomer(customer)}>
              View
            </Button>
          </div>
        ))}

        {!filteredCustomers.length && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-rudi-card">
            <h3 className="font-heading text-lg text-rudi-maroon">No matches yet</h3>
            <p className="mt-2 text-sm text-rudi-maroon/70">
              Try a different search, or invite new guests to join the fun.
            </p>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedCustomer)} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-xl rounded-3xl border-none p-0 shadow-2xl">
          <DialogHeader className="space-y-1 rounded-t-3xl bg-rudi-teal/10 px-6 py-5">
            <DialogTitle className="font-heading text-xl text-rudi-maroon">
              {selectedCustomer?.name}
            </DialogTitle>
            <p className="text-sm text-rudi-maroon/60">{selectedCustomer?.email}</p>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-4 rounded-2xl border border-rudi-teal/15 bg-rudi-sand/50 p-4 text-sm text-rudi-maroon/80 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-rudi-maroon">{selectedCustomer?.totalStamps}</span>{' '}
                total stamps
              </div>
              <div>Last visit: {selectedCustomer?.lastVisit}</div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-rudi-maroon">
                Active loyalty journeys
              </Label>
              <div className="space-y-3">
                {selectedCustomer?.programs.map((program) => {
                  const progress = Math.min(
                    Math.round((program.progress / program.threshold) * 100),
                    100
                  )
                  return (
                    <div key={program.id} className="rounded-2xl border border-rudi-teal/15 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-rudi-maroon">{program.name}</span>
                        <span className="text-rudi-maroon/60">
                          {program.progress}/{program.threshold} stamps
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-rudi-sand">
                        <div
                          className="h-full rounded-full bg-rudi-teal transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {!selectedCustomer?.programs.length && (
                  <div className="rounded-2xl bg-rudi-sand/60 p-4 text-sm text-rudi-maroon/70">
                    No active programs yet - invite them to their first reward adventure!
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between rounded-b-3xl bg-white px-6 py-4">
            <div className="text-xs text-rudi-maroon/60">
              Nice work - another happy customer!
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                className="rounded-2xl border border-rudi-teal/30 bg-white px-4 py-2 text-sm font-semibold text-rudi-coral hover:bg-rudi-coral/10"
                onClick={() => handleManualAction('revoke')}
              >
                Revoke stamp
              </Button>
              <Button type="button" className="btn-primary" onClick={() => handleManualAction('add')}>
                Add manual stamp
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <div
          className={`fixed bottom-8 right-6 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-rudi-teal' : 'bg-rudi-yellow text-rudi-maroon'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Customers

