import {
  Gift01,
  ShieldTick,
  QrCode02,
  BarChartSquare02,
  Users01,
  PieChart01,
  Stars02,
} from '@untitled-ui/icons-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

const capabilityCards = [
  {
    title: 'Stamp & QR orchestration',
    description:
      'Issue single-use join, stamp, and redeem QR codes from the dashboard. The backend ledger enforces “one scan, one reward” while allowing staff overrides with audit trails.',
    icon: QrCode02,
  },
  {
    title: 'Program builder',
    description:
      'Launch punch-card or points programs with rule variations, expiry, and tiered perks. Visual templates mirror what customers see so branding stays on-message.',
    icon: Stars02,
  },
  {
    title: 'Customer intelligence',
    description:
      'Track loyalty streaks, visit cadence, and preferred locations. Segment members for targeted offers while respecting encrypted personal data boundaries.',
    icon: Users01,
  },
  {
    title: 'Anti-fraud & controls',
    description:
      'Device fingerprinting, nonce validation, and rotating QR windows keep redemptions honest. Manual adjustments log to the activity timeline for compliance.',
    icon: ShieldTick,
  },
]

const insightTiles = [
  { label: 'Active loyalty members', value: '18.2K', delta: '+12% MoM' },
  { label: 'Monthly redemptions', value: '4,980', delta: '+640 vs last month' },
  { label: 'Average visit interval', value: '6.3 days', delta: '-1.2 days' },
  { label: 'Retention uplift', value: '21%', delta: '+4 pts since launch' },
]

const workflowSteps = [
  {
    title: '1. Configure locations & staff roles',
    detail:
      'Invite teammates, assign permissions, and map every branch. Staff logins tie directly to stamp issuance logs for clear accountability.',
  },
  {
    title: '2. Build stamp journeys',
    detail:
      'Choose a template, set thresholds, upload artwork, and define reward copy. The preview shows the exact card that customers will see in their PWA.',
  },
  {
    title: '3. Issue QR kits & go live',
    detail:
      'Print dynamic QR posters or keep them inside tablets. Each scan hits `/api/v1/qr/*`, updates the ledger, and powers real-time analytics.',
  },
  {
    title: '4. Optimize with insights',
    detail:
      'Use dashboards, cohort charts, and “Recent Activity” feeds to tweak offers. Export CSV or sync via API for deeper BI workflows.',
  },
]

const ForMerchants = () => {
  return (
    <main className="bg-[#FDF6EC] text-[#3B1F1E]">
      <NavBar />

      <header className="mx-auto max-w-6xl px-4 pt-20 pb-14 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9E6A4F]">For merchants</p>
        <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-6">
            <h1 className="font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Operate intelligent loyalty programs with zero engineering effort.
            </h1>
            <p className="text-lg text-[#3B1F1E]/80">
              Rudi combines QR-first punch cards, anti-fraud controls, and rich analytics in one POS-friendly workspace.
              Launch in a week, scale across locations, and see every stamp, reward, and visit in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = '/register')}
                className="flex h-12 items-center justify-center rounded-2xl bg-[#009688] px-6 font-semibold text-white shadow-lg shadow-[#009688]/30 transition hover:-translate-y-0.5"
              >
                Start a free pilot
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/contact')}
                className="flex h-12 items-center justify-center rounded-2xl border border-[#3B1F1E]/15 px-6 text-sm font-semibold text-[#3B1F1E] transition hover:bg-[#F1E3D3]"
              >
                Talk to our team
              </button>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/95 p-8 shadow-[0_35px_80px_-25px_rgba(59,31,30,0.35)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9E6A4F]">Live health snapshot</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {insightTiles.map((tile) => (
                <div key={tile.label} className="rounded-2xl bg-[#FDF6EC] p-4 shadow-inner shadow-white">
                  <p className="text-xs uppercase tracking-wide text-[#9E6A4F]">{tile.label}</p>
                  <p className="mt-2 font-heading text-2xl text-[#3B1F1E]">{tile.value}</p>
                  <p className="text-xs font-semibold text-[#009688]">{tile.delta}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-[#009688]/20 bg-[#009688]/10 p-4">
              <p className="text-sm font-semibold text-[#3B1F1E]">Today’s signal</p>
              <p className="mt-2 text-sm text-[#3B1F1E]/70">
                “Morning drip” booster is up 24% week-over-week. Send celebratory notes to top 50 members?
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9E6A4F]">Capabilities</p>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl">Everything you need to run a modern loyalty program</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {capabilityCards.map((card) => (
              <div
                key={card.title}
                className="flex h-full flex-col rounded-3xl border border-[#3B1F1E]/10 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(59,31,30,0.55)]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF6EC] text-[#009688]">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl text-[#3B1F1E]">{card.title}</h3>
                <p className="mt-3 text-sm text-[#3B1F1E]/75">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9E6A4F]">Operations flow</p>
              <h2 className="mt-3 font-heading text-2xl">From onboarding to optimization</h2>
              <ol className="mt-6 space-y-4">
                {workflowSteps.map((step) => (
                  <li key={step.title} className="rounded-2xl border border-[#3B1F1E]/10 bg-white p-4 shadow-sm">
                    <p className="font-heading text-lg text-[#3B1F1E]">{step.title}</p>
                    <p className="text-sm text-[#3B1F1E]/75">{step.detail}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_35px_70px_-35px_rgba(59,31,30,0.45)]">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9E6A4F]">Charts & metrics</p>
              <div className="mt-6 grid gap-6">
                <div className="rounded-2xl bg-[#FDF6EC] p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#9E6A4F]">Stamps vs redemptions</p>
                      <p className="font-heading text-2xl text-[#3B1F1E]">4.9k : 1.3k</p>
                    </div>
                    <BarChartSquare02 className="h-8 w-8 text-[#009688]" />
                  </div>
                  <div className="mt-4 h-24 rounded-xl bg-gradient-to-r from-[#009688]/20 to-[#FFB300]/20"></div>
                </div>
                <div className="rounded-2xl border border-[#3B1F1E]/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-[#9E6A4F]">Member mix</p>
                    <PieChart01 className="h-6 w-6 text-[#FF6F61]" />
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[#3B1F1E]/80">
                    <li>38% Weekly regulars</li>
                    <li>44% Returning within 14 days</li>
                    <li>18% New this month</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#3B1F1E]/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-[#9E6A4F]">Recent events</p>
                    <Gift01 className="h-6 w-6 text-[#009688]" />
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[#3B1F1E]/75">
                    <li>• Reward redeemed by Salma G. (KES 450 spend)</li>
                    <li>• Manual stamp issued to Amina W. (staff override)</li>
                    <li>• “Morning drip” booster triggered 12 streaks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#3B1F1E] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Get started</p>
          <h2 className="mt-3 font-heading text-3xl">Build loyalty that feels personal</h2>
          <p className="mt-3 text-white/75">
            Deploy stamp journeys, monitor impact, and surprise customers with relevant perks. We’ll partner with your
            team every step of the way.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => (window.location.href = '/register')}
              className="w-full rounded-2xl bg-white px-6 py-3 font-semibold text-[#3B1F1E] shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
            >
              Launch pilot
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = '/demo')}
              className="w-full rounded-2xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Explore the demo dashboard
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default ForMerchants
