# Rudi Loyalty App

A full-stack digital loyalty punch-card system with separate merchant and customer frontends, a FastAPI backend, QR-based program logic, anti-fraud protection, and mobile packaging.

## Features

- **Backend**: FastAPI with PostgreSQL, JWT authentication, QR code generation and scanning for loyalty programs.
- **Frontend**: Separate React + Vite apps for merchants and customers, with a shared UI library using Tailwind CSS and shadcn/ui.
- **Loyalty Logic**: Join programs, earn stamps via QR scans, redeem rewards with balance checks.
- **Analytics & Revenue Estimation**: Merchants can view loyalty program performance, including customer enrollment, stamps issued/redeemed, and estimated revenue uplift from increased visits.
- **Anti-Fraud**: Device fingerprints, Redis nonce storage, rate limiting, idempotent operations.
- **Mobile Ready**: PWA support for customer app.

## Workspace Layout

This project uses npm workspaces for monorepo management. The structure is as follows:

- `backend/` — FastAPI backend with PostgreSQL, Alembic migrations, and pytest tests.
- `merchant-frontend/` — React + Vite frontend for merchants to manage programs and issue QR codes.
- `customer-frontend/` — React + Vite PWA frontend for customers to scan QR codes and track loyalty.
- `packages/ui/` — Shared UI library with Tailwind CSS + shadcn/ui components.

## Prerequisites

- Node.js >=18
- Python >=3.10
- PostgreSQL (for production) or Docker (for local dev)
- Redis (for anti-fraud features)

## Installation

1. Clone the repository.
2. Run `npm install` in the root directory to install dependencies for all workspaces.
3. For backend: `cd backend && pip install -r requirements.txt`

## Backend Setup

### Environment Variables

Create a `.env` file in `backend/` with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rudi_db
SECRET_KEY=your-secret-key-here
SIGNING_KEY=your-signing-key-here
REDIS_URL=redis://localhost:6379
```

### Database

1. Start PostgreSQL (or use Docker: `docker-compose up -d` in `backend/`).
2. Run migrations: `cd backend && alembic upgrade head`
3. (Optional) Seed data or run tests: `pytest`

### Running the Backend

- Development: `cd backend && python run.py` (starts uvicorn on port 8000)
- API Docs: Visit `http://localhost:8000/docs` for Swagger UI

## Frontend Setup

### Shared UI Library

- Build: `npm -w packages/ui run build`

### Merchant Frontend

- Development: `npm -w merchant-frontend run dev` (port 3000)
- Build: `npm -w merchant-frontend run build`

### Customer Frontend

- Development: `npm -w customer-frontend run dev` (port 3001)
- Build: `npm -w customer-frontend run build`
- PWA: Build and serve for mobile app experience

## Development

All commands from root:

- Start all frontends: `npm run dev`
- Build all: `npm run build`
- Backend tests: `cd backend && pytest --cov=app`
- Linting: `npm run lint`

## API Overview

- **Auth**: Register/login as merchant or customer, JWT tokens.
- **Merchants**: CRUD for merchants, locations, programs, analytics.
- **Programs**: Public read for customer apps.
- **QR**: Issue join/stamp/redeem QR codes, scan with geofencing and anti-fraud.
- **Analytics**: Get merchant analytics data and top customers for revenue estimation.

## Deployment

- Backend: Deploy FastAPI to cloud (e.g., Railway, Heroku) with PostgreSQL and Redis.
- Frontend: Deploy to Vercel/Netlify, build PWA for app stores.

## Reward Logic

The loyalty engine now models visits, rewards, and fraud controls end-to-end:

### Domain Model
- **Programs** define `stamps_required`, `reward_description`, `reward_expiry_days`, and `allow_repeat_cycles`.
- **Enrollments** (`customer_program_memberships`) capture `customer_id`, `merchant_id`, `program_id`, `joined_via`, timestamps, and the active `current_cycle`.
- **Stamps** persist every visit with `(enrollment_id, program_id, merchant_id, customer_id, tx_id, issued_by_staff_id, issued_at, cycle)` plus a unique `(program_id, tx_id)` constraint for idempotency.
- **Rewards** track state per enrollment cycle with `status ∈ {inactive, redeemable, redeemed, expired}`, voucher metadata, expiries, and audit payloads.
- **Audit Logs** store every state transition for anomaly detection and reconciliation.

### State Machine
`INACTIVE -> REDEEMABLE -> (REDEEMED | EXPIRED)` per enrollment cycle.
1. **Stamp Issued** (`/api/v1/enrollments/:id/stamps`): After each unique `tx_id`, stamps are counted for the current cycle. When `stamps_in_cycle == stamps_required`, the reward transitions to `redeemable`, `voucher_code` (base32 HMAC of `rewardId + customerId + cycle`) is generated, and optional `redeem_expires_at` is set.
2. **Redeem** (`/api/v1/rewards/:rewardId/redeem`): Requires merchant/staff auth, matching voucher code, and (if configured) a non-expired `redeem_expires_at`. Success logs `reward.redeemed`.
3. **Expire** (`/api/v1/rewards/:rewardId/expire` or scheduled job): Moves redeemable-but-expired vouchers to `expired` and prevents replay.
4. **Cycle Reset**: After redeem/expire the enrollment increments `current_cycle`, stamps continue in the next cycle iff `program.allow_repeat_cycles = true`; otherwise additional stamps are ignored.

### API Surface
- `POST /api/v1/programs/{programId}/enroll` (customer) validates the signed in-store QR (nonce, expiry, geofence) and creates the enrollment if needed.
- `POST /api/v1/enrollments/{enrollmentId}/stamps` (merchant/staff) writes a stamp, enforces `(program_id, tx_id)` uniqueness, and returns the updated reward snapshot.
- `GET /api/v1/enrollments/{enrollmentId}/reward` (customer/merchant) returns voucher code, expiry, status, and derived `stamps_in_cycle`.
- `POST /api/v1/rewards/{rewardId}/redeem` (merchant/staff) performs guarded redemption with idempotent behavior for repeats.
- `POST /api/v1/rewards/{rewardId}/expire` (system/admin) forces expiration for scheduled jobs.

### Fraud & Integrity
- Base32 HMAC voucher codes + QR payload validation (program, merchant, timestamp, nonce) for in-store joins.
- Uniqueness on `(program_id, tx_id)` prevents replay; optional min spacing/device fingerprints can layer on later.
- Audit events `stamp.issued`, `reward.reached`, `reward.redeemed`, `reward.expired` feed analytics and monitoring.
- No running counters: `stamps_in_cycle` derives from the `stamps` table filtered by `cycle`, while analytics snapshots still aggregate via Ledger/Audit pipelines.

### Frontend UX (summary)
- Customers see punch cards that progress `n / N` stamps and expose voucher code/QR only when `redeemable`, with "Valid until ..." messaging.
- Merchant dashboards get stamp issuance tooling (QR scan or manual tx), redemption modals with voucher verification, and reward logs filtered by status/date/staff.

## Contributing

1. Follow the monorepo structure.
2. Run tests and linting before PR.
3. Use conventional commits.

## License

MIT License - see LICENSE file for details.
