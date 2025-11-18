import { useMemo, useState } from 'react'
import { ArrowRight, Ban, ClipboardPen, Play, UserCircle2 } from 'lucide-react'

type MerchantRow = {
  id: string
  name: string
  owner: string
  plan: 'free' | 'growth' | 'enterprise'
  mrr: number
  status: 'active' | 'suspended'
}

type CustomerRow = {
  id: string
  name: string
  email: string
  merchants: number
  rewards: number
}

type LeadRow = {
  id: string
  company: string
  contact: string
  status: 'new' | 'contacted' | 'qualified'
  source: string
}

const currency = (value: number) => `KES ${value.toLocaleString()}`

const DeveloperDashboard = () => {
  const [merchants, setMerchants] = useState<MerchantRow[]>([
    { id: 'm-1', name: 'Amber & Oak Café', owner: 'lena@amberoak.com', plan: 'growth', mrr: 12900, status: 'active' },
    { id: 'm-2', name: 'Atelier Beauty', owner: 'coo@atelier.com', plan: 'enterprise', mrr: 28900, status: 'active' },
    { id: 'm-3', name: 'Farm & Pantry', owner: 'hello@farmandpantry.com', plan: 'free', mrr: 0, status: 'suspended' },
  ])
  const [customers] = useState<CustomerRow[]>([
    { id: 'c-1', name: 'Yazmin Obiero', email: 'yazmin@example.com', merchants: 4, rewards: 8 },
    { id: 'c-2', name: 'Ken Mwangi', email: 'ken@example.com', merchants: 2, rewards: 3 },
    { id: 'c-3', name: 'Fatma Abdalla', email: 'fatma@example.com', merchants: 3, rewards: 6 },
  ])
  const [leads, setLeads] = useState<LeadRow[]>([
    { id: 'l-1', company: 'Beanline Roasters', contact: 'hello@beanline.com', status: 'contacted', source: 'Landing' },
    { id: 'l-2', company: 'Glow & Co. Spa', contact: 'ops@glowco.com', status: 'new', source: 'Sales form' },
    { id: 'l-3', company: 'Crust Bakery', contact: 'hi@crust.bakery', status: 'qualified', source: 'Referral' },
  ])

  const totals = useMemo(() => {
    const mrr = merchants.reduce((sum, m) => sum + m.mrr, 0)
    const activeMerchants = merchants.filter((m) => m.status === 'active').length
    const suspended = merchants.length - activeMerchants
    return { mrr, activeMerchants, suspended, merchants: merchants.length, customers: customers.length }
  }, [merchants, customers.length])

  const toggleMerchantStatus = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m))
    )
  }

  const impersonateMerchant = (id: string) => {
    console.log('Impersonate merchant', id)
  }

  const promoteLeadStage = (id: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status:
                lead.status === 'new' ? 'contacted' : lead.status === 'contacted' ? 'qualified' : 'qualified',
            }
          : lead
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-heading font-semibold text-foreground">Developer Control Center</h1>
        <p className="text-sm text-muted-foreground">
          Manage merchants, customers, subscriptions, revenue, and lead generation with full platform controls.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MRR (mock)</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{currency(totals.mrr)}</p>
          <p className="text-xs text-muted-foreground">Across all merchant plans</p>
        </div>
        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active merchants</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totals.activeMerchants}</p>
          <p className="text-xs text-muted-foreground">{totals.suspended} suspended</p>
        </div>
        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customers</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totals.customers}</p>
          <p className="text-xs text-muted-foreground">Cross-merchant total</p>
        </div>
        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lead pipeline</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{leads.length}</p>
          <p className="text-xs text-muted-foreground">New + contacted + qualified</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card rounded-2xl p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Merchants</p>
              <p className="text-xs text-muted-foreground">View/edit, suspend, impersonate</p>
            </div>
            <button className="btn-primary px-4">Add merchant</button>
          </div>
          <div className="mt-3 divide-y divide-border">
            {merchants.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex min-w-[180px] flex-1 flex-col">
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.owner}</span>
                </div>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                  {m.plan}
                </span>
                <span className="text-sm font-semibold text-foreground">{currency(m.mrr)}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                    m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {m.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-border px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted"
                    onClick={() => impersonateMerchant(m.id)}
                  >
                    Impersonate
                  </button>
                  <button
                    className="rounded-lg border border-border px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted"
                    onClick={() => toggleMerchantStatus(m.id)}
                  >
                    {m.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Subscriptions</p>
              <p className="text-xs text-muted-foreground">Plan mix & renewals (mock)</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-foreground">
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
              <span>Free → Growth</span>
              <span className="font-semibold text-green-700">+12 this week</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
              <span>Growth → Enterprise</span>
              <span className="font-semibold text-foreground">+3 this week</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
              <span>Churn (mock)</span>
              <span className="font-semibold text-red-600">-1 this week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Customers</p>
              <p className="text-xs text-muted-foreground">View top customers across merchants</p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-border">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-foreground">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-foreground">
                  <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold">
                    {c.merchants} merchants
                  </span>
                  <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold">
                    {c.rewards} rewards
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Leads</p>
              <p className="text-xs text-muted-foreground">Lifecycle management</p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-border">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-foreground">{lead.company}</p>
                  <p className="text-xs text-muted-foreground">{lead.contact}</p>
                  <p className="text-xs text-muted-foreground">Source: {lead.source}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {lead.status}
                  </span>
                  <button
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    onClick={() => promoteLeadStage(lead.id)}
                  >
                    Advance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Controls</p>
            <p className="text-xs text-muted-foreground">Impersonate or suspend accounts</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {merchants.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-surface p-3 shadow-sm">
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.owner}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-semibold text-foreground hover:bg-muted"
                  onClick={() => impersonateMerchant(m.id)}
                >
                  <Play className="h-3.5 w-3.5" /> Impersonate
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-semibold text-foreground hover:bg-muted"
                  onClick={() => toggleMerchantStatus(m.id)}
                >
                  <Ban className="h-3.5 w-3.5" /> {m.status === 'active' ? 'Suspend' : 'Unsuspend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeveloperDashboard
