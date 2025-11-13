import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import {
  Badge,
  Button,
  Loader,
  Modal,
  TextInput,
  Text,
} from '@mantine/core'
import { useWebSocket } from '../contexts/WebSocketContext'

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

type RedemptionEvent = {
  id: string
  programId: string
  programName: string
  status: string
  reachedAt?: string | null
  redeemedAt?: string | null
  voucherCode?: string | null
  cycle?: number | null
}

type ActivityEvent = {
  id: string
  programId: string
  programName?: string | null
  entryType: string
  change: number
  timestamp?: string | null
  notes?: string | null
}

type RewardSummary = {
  redeemed: number
  redeemable: number
  expired: number
}

type CustomerDetail = CustomerRecord & {
  redemptionHistory: RedemptionEvent[]
  recentActivity: ActivityEvent[]
  rewardSummary: RewardSummary
}

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { lastMessage } = useWebSocket()
  const selectedCustomerIdRef = useRef<string | null>(null)
  const detailCacheRef = useRef<Record<string, CustomerDetail>>({})

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

  const formatTimelineValue = (rawValue?: string | null): string | null => {
    if (!rawValue) return null
    return formatLastVisit(rawValue) ?? rawValue
  }

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'redeemed':
        return 'teal'
      case 'redeemable':
        return 'blue'
      case 'expired':
        return 'gray'
      default:
        return 'dark'
    }
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

  useEffect(() => {
    selectedCustomerIdRef.current = selectedCustomer?.id ?? null
  }, [selectedCustomer])

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerDetail(null)
      return
    }
    void loadCustomerDetail(selectedCustomer.id)
  }, [selectedCustomer])

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return
    if ((lastMessage as { type?: string }).type !== 'customer_stamp_update') return
    const { customer_id, program_id, new_balance, delta, timestamp, program_name, removed } = lastMessage as Record<string, any>
    if (!customer_id || !program_id) return

    if (removed) {
      setCustomers((prev) =>
        prev
          .map((customer) => {
            if (customer.id !== customer_id) {
              return customer
            }
            const programs = customer.programs.filter((program) => program.id !== program_id)
            if (!programs.length) {
              return null
            }
            return {
              ...customer,
              programs,
              totalStamps: programs.reduce((sum, p) => sum + p.progress, 0),
            }
          })
          .filter((customer): customer is CustomerRecord => Boolean(customer))
      )

      if (selectedCustomerIdRef.current === customer_id) {
        setSelectedCustomer((prev) => {
          if (!prev) return prev
          const programs = prev.programs.filter((program) => program.id !== program_id)
          if (!programs.length) {
            return null
          }
          return {
            ...prev,
            programs,
            totalStamps: programs.reduce((sum, p) => sum + p.progress, 0),
          }
        })
      }
      return
    }

    if (typeof new_balance !== 'number') return

    let nextSelection: CustomerRecord | null = null
    let updatedCustomerFound = false
    const selectedId = selectedCustomerIdRef.current

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customer_id) {
          return customer
        }
        updatedCustomerFound = true
        const programExists = customer.programs.some((program) => program.id === program_id)
        const inferredThreshold = customer.programs[0]?.threshold ?? 10
        const programs = programExists
          ? customer.programs.map((program) =>
              program.id === program_id ? { ...program, progress: new_balance } : program
            )
          : [
              ...customer.programs,
              {
                id: program_id,
                name: program_name ?? 'Program',
                progress: new_balance,
                threshold: inferredThreshold,
              },
            ]
        const totalStamps = programs.reduce((sum, p) => sum + p.progress, 0)
        const formattedLastVisit =
          (typeof timestamp === 'string' && formatLastVisit(timestamp)) || customer.lastVisit
        const updatedCustomer = {
          ...customer,
          programs,
          totalStamps,
          lastVisit: formattedLastVisit ?? customer.lastVisit,
        }
        if (selectedId === customer_id) {
          nextSelection = updatedCustomer
        }
        return updatedCustomer
      })
    )

    if (!updatedCustomerFound) {
      void fetchCustomers()
      return
    }

    if (nextSelection) {
      setSelectedCustomer(nextSelection)
      setCustomerDetail((prev) => {
        if (!prev || prev.id !== nextSelection.id) {
          return prev
        }
        const updatedDetail: CustomerDetail = {
          ...prev,
          programs: nextSelection.programs,
          totalStamps: nextSelection.totalStamps,
          lastVisit: nextSelection.lastVisit ?? prev.lastVisit,
        }
        detailCacheRef.current[nextSelection.id] = updatedDetail
        return updatedDetail
      })
    }

    if (typeof delta === 'number') {
      const message =
        delta > 0
          ? `Stamp added${program_name ? ` for ${program_name}` : ''}`
          : `Stamp revoked${program_name ? ` for ${program_name}` : ''}`
      showToast(delta > 0 ? 'success' : 'info', message)
    }
  }, [lastMessage])

  const filteredCustomers = useMemo(() => {
    if (!query) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [customers, query])

  const detailSource = customerDetail ?? selectedCustomer

  const showToast = (type: 'success' | 'info', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2400)
  }

  const loadCustomerDetail = async (customerId: string, forceRefresh = false) => {
    if (!customerId) return
    if (!forceRefresh) {
      const cached = detailCacheRef.current[customerId]
      if (cached) {
        setCustomerDetail(cached)
        return
      }
    }
    setDetailLoading(true)
    try {
      const response = await axios.get(`/api/v1/merchants/customers/${customerId}`)
      const payload = response.data ?? {}

      const programs: CustomerProgram[] = (payload.programs ?? []).map((program: any) => ({
        id: program.id ?? crypto.randomUUID(),
        name: program.name ?? 'Program',
        progress: program.progress ?? 0,
        threshold: program.threshold ?? 10,
      }))

      const seenHistoryIds = new Set<string>()
      const redemptionHistory: RedemptionEvent[] = []
      const rawHistory = payload.redemption_history ?? payload.redemptionHistory ?? []
      for (const entry of rawHistory) {
        const id = entry?.id ?? crypto.randomUUID()
        if (seenHistoryIds.has(id)) continue
        seenHistoryIds.add(id)
        redemptionHistory.push({
          id,
          programId: entry?.program_id ?? entry?.programId ?? crypto.randomUUID(),
          programName: entry?.program_name ?? entry?.programName ?? 'Program',
          status: (entry?.status ?? 'unknown').toString(),
          reachedAt: entry?.reached_at ?? entry?.reachedAt ?? null,
          redeemedAt: entry?.redeemed_at ?? entry?.redeemedAt ?? null,
          voucherCode: entry?.voucher_code ?? entry?.voucherCode ?? null,
          cycle: entry?.cycle ?? null,
        })
      }

      const recentActivity: ActivityEvent[] = (
        payload.recent_activity ?? payload.recentActivity ?? []
      ).map((activity: any) => ({
        id: activity.id ?? crypto.randomUUID(),
        programId: activity.program_id ?? activity.programId ?? crypto.randomUUID(),
        programName: activity.program_name ?? activity.programName ?? null,
        entryType: (activity.entry_type ?? activity.entryType ?? 'EARN').toString(),
        change:
          typeof activity.change === 'number'
            ? activity.change
            : typeof activity.amount === 'number'
            ? activity.amount
            : 0,
        timestamp: activity.timestamp ?? activity.created_at ?? activity.createdAt ?? null,
        notes: activity.notes ?? null,
      }))

      const rewardSummary: RewardSummary =
        payload.reward_summary ?? payload.rewardSummary ?? {
          redeemed: 0,
          redeemable: 0,
          expired: 0,
        }

      const normalized: CustomerDetail = {
        id: payload.id ?? customerId,
        name: payload.name ?? selectedCustomer?.name ?? 'Valued Guest',
        email: payload.email ?? selectedCustomer?.email ?? 'unknown',
        avatar: resolveAvatarUrl(payload.avatar) ?? selectedCustomer?.avatar,
        totalStamps:
          payload.total_stamps ?? payload.totalStamps ?? programs.reduce((sum, p) => sum + p.progress, 0),
        lastVisit:
          formatTimelineValue(payload.last_visit_display ?? payload.last_visit ?? payload.lastVisit) ??
          selectedCustomer?.lastVisit ??
          null,
        programs: programs.length ? programs : selectedCustomer?.programs ?? [],
        redemptionHistory,
        recentActivity,
        rewardSummary,
      }

      detailCacheRef.current[customerId] = normalized
      setCustomerDetail(normalized)
    } catch (error) {
      console.error('Failed to load customer details', error)
      showToast('info', 'Unable to load customer details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleManualAction = async (action: 'add' | 'revoke') => {
    if (!selectedCustomer || selectedCustomer.programs.length === 0) return

    const currentCustomerId = selectedCustomer.id

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
        if (updatedSelected) {
          detailCacheRef.current[updatedSelected.id] = {
            ...(detailCacheRef.current[updatedSelected.id] ?? updatedSelected),
            id: updatedSelected.id,
            name: updatedSelected.name,
            email: updatedSelected.email,
            avatar: updatedSelected.avatar,
            programs: updatedSelected.programs,
            totalStamps: updatedSelected.totalStamps,
            lastVisit: updatedSelected.lastVisit,
            redemptionHistory: detailCacheRef.current[updatedSelected.id]?.redemptionHistory ?? [],
            recentActivity: detailCacheRef.current[updatedSelected.id]?.recentActivity ?? [],
            rewardSummary: detailCacheRef.current[updatedSelected.id]?.rewardSummary ?? {
              redeemed: 0,
              redeemable: 0,
              expired: 0,
            },
          }
        }
        await loadCustomerDetail(currentCustomerId, true)
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
      delete detailCacheRef.current[selectedCustomer.id]
      setCustomerDetail(null)
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
            onClick={() => setSelectedCustomer(customer)}
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

      <Modal opened={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} title={detailSource?.name} size="xl">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            {detailSource?.avatar ? (
              <img
                src={detailSource.avatar}
                alt={detailSource.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                {detailSource?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-foreground">{detailSource?.name}</p>
              <p className="text-sm text-muted-foreground">{detailSource?.email}</p>
            </div>
          </div>

          {detailLoading && (
            <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Loader size="sm" />
              <span>Loading detailed history...</span>
            </div>
          )}

          <div className="grid gap-4 rounded-2xl border border-primary/15 bg-muted/50 p-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <span className="font-semibold text-foreground">{detailSource?.totalStamps ?? 0}</span>{' '}
              total stamps
            </div>
            <div>Last visit: {detailSource?.lastVisit ?? 'Never'}</div>
          </div>

          {customerDetail?.rewardSummary && (
            <div className="grid gap-3 rounded-2xl border border-primary/15 bg-surface/80 p-4 text-sm text-muted-foreground sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Redeemed</p>
                <p className="text-lg font-semibold text-foreground">{customerDetail.rewardSummary.redeemed}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ready to redeem</p>
                <p className="text-lg font-semibold text-foreground">{customerDetail.rewardSummary.redeemable}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expired</p>
                <p className="text-lg font-semibold text-foreground">{customerDetail.rewardSummary.expired}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Text className="text-sm font-semibold text-foreground">
              Active loyalty journeys
            </Text>
            <div className="space-y-3">
              {detailSource?.programs.map((program) => {
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
              {!detailSource?.programs.length && (
                <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  No active programs yet - invite them to their first reward adventure!
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Text className="text-sm font-semibold text-foreground">Redemption history</Text>
            {customerDetail?.redemptionHistory?.length ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {customerDetail.redemptionHistory.map((reward) => (
                  <div key={reward.id} className="rounded-2xl border border-primary/10 bg-card/70 p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{reward.programName}</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.redeemedAt
                            ? `Redeemed ${formatTimelineValue(reward.redeemedAt) ?? ''}`
                            : reward.reachedAt
                            ? `Unlocked ${formatTimelineValue(reward.reachedAt) ?? ''}`
                            : 'Status pending'}
                        </p>
                      </div>
                      <Badge color={statusColor(reward.status)} variant="light">
                        {reward.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    {reward.voucherCode && (
                      <p className="mt-2 text-xs font-mono text-muted-foreground">Code: {reward.voucherCode}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                No reward history recorded yet.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Text className="text-sm font-semibold text-foreground">Recent stamp activity</Text>
            {customerDetail?.recentActivity?.length ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {customerDetail.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between rounded-2xl border border-primary/10 bg-surface/80 px-3 py-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{activity.programName ?? 'Program update'}</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.entryType} · {formatTimelineValue(activity.timestamp) ?? 'Recently'}
                      </span>
                    </div>
                    <span className={`font-semibold ${activity.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.change >= 0 ? `+${activity.change}` : activity.change} stamps
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                No recent visits logged yet.
              </div>
            )}
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
