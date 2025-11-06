import NavBar from '../components/NavBar'
import {
  Gift01,
  ShieldTick,
  QrCode02,
  Stars02,
  Users01,
  Award02,
} from '@untitled-ui/icons-react'

const merchantJourney = [
  {
    title: '1. Launch your workspace',
    description:
      'Merchants sign up, invite teammates, and configure business details. Authentication is email-first with secure session handling from our FastAPI backend.',
    icon: ShieldTick,
  },
  {
    title: '2. Design loyalty programs',
    description:
      'Create punch cards or point rules, upload artwork, and define earn/redeem thresholds. Programs stay in sync with the backend `LoyaltyProgram` model so analytics stay accurate.',
    icon: Stars02,
  },
  {
    title: '3. Issue QR codes & track scans',
    description:
      'Generate single-use QR codes for joining, stamping, and redeeming. Each scan hits the `/qr` endpoints, updates the ledger, and pushes live telemetry back to the dashboard.',
    icon: QrCode02,
  },
  {
    title: '4. Operate with insights',
    description:
      'Dashboard widgets show active members, redemptions, and streak boosters. Recent-activity feeds and analytics cards clarify what is working across locations.',
    icon: Award02,
  },
]

const customerJourney = [
  {
    title: '1. Discover & join',
    description:
      'Customers browse nearby programs in the PWA, scan a merchant QR, and instantly receive a digital stamp card tied to their membership record.',
    icon: Users01,
  },
  {
    title: '2. Earn stamps securely',
    description:
      'Each visit triggers a scan or manual issuance. Anti-fraud rules (device fingerprinting, nonce validation, and QR expiry) live in the backend ledger pipeline.',
    icon: ShieldTick,
  },
  {
    title: '3. Redeem & celebrate',
    description:
      'When thresholds are met, customers request a reward code that merchants verify inside the Rewards table. Confetti, notifications, and resets keep the loop delightful.',
    icon: Gift01,
  },
  {
    title: '4. Stay engaged',
    description:
      'Announcements, manual adjustments, and analytics-driven offers appear on the customer dashboard and notification rail, encouraging repeat visits.',
    icon: Stars02,
  },
]

const collaborationPoints = [
  {
    heading: 'Shared data model',
    copy: 'Both apps talk to the same FastAPI services (`/api/v1/customer/*` and `/api/v1/merchants/*`). Every scan writes to the ledger and exposes identical truths to merchants and customers.',
  },
  {
    heading: 'QR & security layer',
    copy: 'QR endpoints generate single-use codes with nonce + expiry metadata. The merchant UI enforces “one scan, one reward” while the customer UI respects countdowns and status polling.',
  },
  {
    heading: 'Notifications & activity',
    copy: 'Manual stamp issuance, revokes, and reward redemptions post to activity feeds on both sides. Merchants see “Recent Activity” widgets while customers get scrollable updates under the greeting.',
  },
]

const HowItWorks = () => {
  return (
    <main className="bg-[#FDF6EC] text-[#3B1F1E]">
      <NavBar />
      <header className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9E6A4F]">How it works</p>
        <h1 className="mt-4 font-heading text-3xl leading-tight sm:text-4xl">
          One platform, two tailored experiences
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-[#3B1F1E]/80">
          Rudi pairs a POS-friendly merchant dashboard with a mobile-first customer PWA. Both run on our shared
          FastAPI backend, leveraging the QR, ledger, and analytics stacks described in <code>opencode_prompts.md</code>.
          Here’s how everything fits together.
        </p>
      </header>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <article className="rounded-3xl border border-rudi-maroon/10 bg-white p-8 shadow-[0_25px_60px_-45px_rgba(59,31,30,0.7)]">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9E6A4F]">Merchant app</p>
              <h2 className="mt-3 font-heading text-2xl">From onboarding to insights</h2>
              <ul className="mt-6 space-y-5">
                {merchantJourney.map((step) => (
                  <li key={step.title} className="flex gap-4">
                    <div className="rounded-2xl bg-[#FDF6EC] p-3 text-[#009688]">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-heading text-lg">{step.title}</p>
                      <p className="text-sm text-[#3B1F1E]/80">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-rudi-maroon/10 bg-white p-8 shadow-[0_25px_60px_-45px_rgba(59,31,30,0.7)]">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9E6A4F]">Customer app</p>
              <h2 className="mt-3 font-heading text-2xl">Scan, earn, redeem</h2>
              <ul className="mt-6 space-y-5">
                {customerJourney.map((step) => (
                  <li key={step.title} className="flex gap-4">
                    <div className="rounded-2xl bg-[#FDF6EC] p-3 text-[#FF6F61]">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-heading text-lg">{step.title}</p>
                      <p className="text-sm text-[#3B1F1E]/80">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl">Where the experiences connect</h2>
        <p className="mt-3 text-[#3B1F1E]/80">
          Every feature echoes across both interfaces. QR scans, ledger movements, and notifications touch the same
          services, so merchants and customers stay perfectly aligned.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {collaborationPoints.map((point) => (
            <div
              key={point.heading}
              className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_45px_-35px_rgba(59,31,30,0.8)]"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[#009688]">{point.heading}</p>
              <p className="mt-3 text-sm text-[#3B1F1E]/80">{point.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#3B1F1E] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Next steps</p>
          <h2 className="mt-4 font-heading text-3xl">Ready to experience both sides?</h2>
          <p className="mt-3 text-white/80">
            Spin up a merchant pilot, then open the customer PWA to see stamps land in real time. The shared
            architecture makes testing easy and trustworthy.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => (window.location.href = '/demo')}
              className="w-full rounded-2xl bg-white px-6 py-3 font-semibold text-[#3B1F1E] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 sm:w-auto"
            >
              Explore the merchant demo
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = '/get-app')}
              className="w-full rounded-2xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Try the customer app
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HowItWorks
