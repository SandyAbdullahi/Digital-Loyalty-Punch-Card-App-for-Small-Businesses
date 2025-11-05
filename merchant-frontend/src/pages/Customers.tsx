import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Modal,
  TextInput,
  Text,
} from '@mantine/core'

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

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const apiBaseUrl =
    (import.meta as any)?.env?.VITE_API_URL ||
    (import.meta as any)?.env?.VITE_MERCHANT_API_URL ||
    axios.defaults.baseURL ||
    window.location.origin;

  const resolveAvatarUrl = (rawValue: unknown): string | null => {
    if (!rawValue || typeof rawValue !== 'string') return null;
    const trimmed = rawValue.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `${apiBaseUrl.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  };

  const formatLastVisit = (rawValue: unknown): string | null => {
    if (!rawValue) return null
    if (typeof rawValue !== 'string') return null
    const normalized = rawValue.trim()
    if (!normalized || normalized.toLowerCase() === 'never') {
      return null
    }
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) {
      return normalized
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/merchants/customers')
      if (Array.isArray(response.data)) {
        setCustomers(
          response.data.map((item: any) => {
            const programs = (item.programs ?? []).map((program: any) => ({
              id: program.id ?? crypto.randomUUID(),
              name: program.name ?? 'Program',
              progress: program.progress ?? 0,
              threshold: program.threshold ?? 10,
            }))
            const formattedLastVisit =
              formatLastVisit(item.last_visit_display ?? item.last_visit) ??
              (programs.length > 0 ? 'Never' : null)
            return {
              id: item.id ?? crypto.randomUUID(),
              name: item.name ?? item.email ?? 'Valued Guest',
              email: item.email ?? 'unknown',
              totalStamps: programs.reduce((sum, p) => sum + p.progress, 0),
              avatar: resolveAvatarUrl(item.avatar),
              lastVisit: formattedLastVisit,
              programs,
            }
          })
        )
      }
     } catch (error) {
       console.error('Failed to fetch customers', error)
       setCustomers([])
     } finally {
       setLoading(false)
     }
  }

  useEffect(() => {
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

  const handleManualAction = async (action: 'add' | 'revoke') => {
    if (!selectedCustomer || selectedCustomer.programs.length === 0) return

    const programId = selectedCustomer.programs[0].id
    const url = `/api/v1/merchants/customers/${selectedCustomer.id}/${action === 'add' ? 'add-stamp' : 'revoke-stamp'}`

    const formData = new FormData()
    formData.append('program_id', programId)

    try {
      await axios.post(url, formData)
      showToast('success', action === 'add' ? 'Stamp added - let the celebration begin!' : 'Stamp revoked - balance back in harmony.')
      // Refetch customers to update stamps
      const response = await axios.get('/api/v1/merchants/customers')
      if (Array.isArray(response.data)) {
        const updatedCustomers = response.data.map((item: any) => ({
          id: item.id ?? crypto.randomUUID(),
          name: item.name ?? item.email ?? 'Valued Guest',
          email: item.email ?? 'unknown',
          totalStamps: item.total_stamps ?? 0,
          avatar: resolveAvatarUrl(item.avatar),
          lastVisit:
            formatLastVisit(item.last_visit_display ?? item.last_visit) ?? 'Just now',
          programs: (item.programs ?? []).map((program: any) => ({
            id: program.id ?? crypto.randomUUID(),
            name: program.name ?? 'Program',
            progress: program.progress ?? 0,
            threshold: program.threshold ?? 10,
          })),
        }))
        setCustomers(updatedCustomers)
        // Update selectedCustomer with new data
        const updatedSelected = updatedCustomers.find(c => c.id === selectedCustomer.id)
        setSelectedCustomer(updatedSelected || null)
      }
    } catch (error) {
      showToast('info', 'Action failed - please try again.')
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    try {
      await axios.delete(`/api/v1/merchants/customers/${selectedCustomer.id}`)
      showToast('success', 'Customer removed successfully.')
      setSelectedCustomer(null)
      setConfirmDelete(false)
      // Refetch customers
      fetchCustomers()
    } catch (error) {
      showToast('info', 'Failed to delete customer.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Search your community of explorers and celebrate their loyalty.
        </p>
      </div>

       <div className="flex justify-center gap-4">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="h-12 w-full max-w-lg rounded-full border-primary/20 bg-card px-5 pt-1 shadow-md"
          />
          <Button
            onClick={fetchCustomers}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
       </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            className="card-hover flex items-center justify-between gap-4 rounded-3xl bg-card px-5 py-4 shadow-lg animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                  {customer.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <div className="hidden flex-col text-right text-sm text-muted-foreground sm:flex">
              <span>
                Total stamps:{' '}
                <strong className="text-foreground">{customer.totalStamps}</strong>
              </span>
              <span>Last visit: {customer.lastVisit ?? 'Never'}</span>
            </div>
            <Button className="btn-secondary" type="button" onClick={() => setSelectedCustomer(customer)}>
              View
            </Button>
          </div>
        ))}

        {!filteredCustomers.length && (
          <div className="rounded-3xl bg-card p-10 text-center shadow-lg">
            <h3 className="font-heading text-lg text-foreground">No matches yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search, or invite new guests to join the fun.
            </p>
          </div>
        )}
      </div>

      <Modal opened={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name} size="xl">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            {selectedCustomer?.avatar ? (
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                {selectedCustomer?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-foreground">{selectedCustomer?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCustomer?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-primary/15 bg-muted/50 p-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <span className="font-semibold text-foreground">{selectedCustomer?.programs.reduce((sum, p) => sum + p.progress, 0)}</span>{' '}
              total stamps
            </div>
            <div>Last visit: {selectedCustomer?.lastVisit ?? 'Never'}</div>
          </div>

          <div className="space-y-3">
            <Text className="text-sm font-semibold text-foreground">
              Active loyalty journeys
            </Text>
            <div className="space-y-3">
              {selectedCustomer?.programs.map((program) => {
                const progress = Math.min(
                  Math.round((program.progress / program.threshold) * 100),
                  100
                )
                return (
                  <div key={program.id} className="rounded-2xl border border-primary/15 bg-surface/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{program.name}</span>
                      <span className="text-muted-foreground">
                        {program.progress}/{program.threshold} stamps
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {!selectedCustomer?.programs.length && (
                <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  No active programs yet - invite them to their first reward adventure!
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Nice work - another happy customer!
            </div>
             <div className="flex gap-3">
               <Button
                 type="button"
                 className="rounded-2xl bg-red-700 text-white px-4 py-2 text-sm font-semibold hover:bg-red-800"
                 onClick={() => setConfirmDelete(true)}
               >
                 Delete Customer
               </Button>
               <Button
                 type="button"
                 className="rounded-2xl bg-red-500 text-white px-4 py-2 text-sm font-semibold hover:bg-red-600"
                 onClick={() => handleManualAction('revoke')}
               >
                 Revoke stamp
               </Button>
               <Button type="button" className="btn-primary" onClick={() => handleManualAction('add')}>
                 Add manual stamp
               </Button>
             </div>
          </div>
        </div>
       </Modal>

       <Modal opened={confirmDelete} onClose={() => setConfirmDelete(false)} title="Confirm Deletion" size="sm">
         <p>Are you sure you want to remove {selectedCustomer?.name} from all your programs? This action cannot be undone.</p>
         <div className="flex gap-3 mt-4">
           <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
           <Button color="red" onClick={handleDelete}>Delete</Button>
         </div>
       </Modal>

       {toast && (
        <div
          className={`fixed bottom-8 right-6 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Customers
