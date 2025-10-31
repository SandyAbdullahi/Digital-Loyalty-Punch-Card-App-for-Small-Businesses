# **opencode_prompts.md**

## 📘 **Project Overview**

**Project Name:** Rudi Loyalty App
**Root Workspace (already exists):** `RUDI APP/` (use this exact folder; do not create a new parent)
**Goal:** Build a full-stack digital loyalty punch-card system with separate merchant and customer frontends, a FastAPI backend, QR-based program logic, anti-fraud protection, and mobile packaging.
**Package Structure (all paths relative to `RUDI APP/`):**

* `backend/` — FastAPI + PostgreSQL
* `merchant-frontend/` — React + Vite + Tailwind + shadcn/ui
* `customer-frontend/` — React + Vite + Tailwind + shadcn/ui (PWA + Capacitor for APK)
* `packages/ui/` — Shared UI system (design tokens, reusable components)

---

## 🧭 **Phase Summary Table**

| Phase | Title                 | Description                                                                  |
| :---- | :-------------------- | :--------------------------------------------------------------------------- |
| 0     | Workspace & Monorepo  | Initialize npm workspaces **inside `RUDI APP/`**, create directories, and CI |
| 1     | Backend Bootstrapping | Create FastAPI backend, models, auth, QR, and ledger logic                   |
| 2     | Shared UI Library     | Build reusable UI system with Tailwind + shadcn/ui                           |
| 3     | Customer Frontend     | PWA for customers (QR join, map, dashboard, rewards)                         |
| 4     | Merchant Frontend     | POS-friendly merchant dashboard for programs and analytics                   |
| 5     | Security & Fraud      | Geofencing, device fingerprints, nonces, rate limits                         |
| 6     | Monetization          | Merchant subscription plans and billing (Stripe/mock)                        |
| 7     | Mobile Packaging      | Package customer PWA into Android APK                                        |
| 8     | Observability & Docs  | Logging, E2E tests, docs, and seed data                                      |
| 9     | Hardening             | Performance, export/import, feature flags, i18n                              |
| 10    | NPM Quality           | Root scripts, workspace docs, and CI cleanup                                 |

---

## **Phase 0 — Workspace & Monorepo Scaffolding**

1. **Inside the existing folder `RUDI APP/`,** initialize npm workspaces (do not create a new folder) and write a root `package.json` named `"rudi-app"` with `"private": true` and `"workspaces": ["merchant-frontend","customer-frontend","packages/ui"]` plus `"engines": {"node": ">=18"}`.
2. Ensure these exact directories exist directly under `RUDI APP/`: create `backend/`, `merchant-frontend/`, `customer-frontend/`, and `packages/ui/` (do not nest them in any new subfolder).
3. At `RUDI APP/`, create `.gitignore` (Node, Python, Vite, dist, .venv, .env*), an MIT `LICENSE`, and a `README.md` explaining the workspace layout and npm workspace commands run from `RUDI APP/`.
4. Add a root `.env.sample` covering all apps: `DATABASE_URL`, `JWT_SECRET`, `MAPS_API_KEY`, `APP_URLS`, `CORS_ORIGINS`, optional `STRIPE_PUBLIC_KEY`, optional `STORAGE_BUCKET`, and `SIGNING_KEY` for QR; include comments for each variable.
5. Create root ESLint/Prettier config shared by both frontends and a VSCode settings file enabling format-on-save and import sorting.
6. Create `packages/ui/tsconfig.base.json` to hold strict TypeScript config and import/order rules to be extended by both frontends (use path aliases via `compilerOptions.paths`).
7. Add GitHub Actions CI at `.github/workflows/ci.yml` in `RUDI APP/` with npm cache and 3 jobs: backend tests/linters, merchant build, and customer build on PRs/pushes to `main`.
8. Sanity check: output the expected top-level tree (only `backend/`, `merchant-frontend/`, `customer-frontend/`, `packages/ui/`, plus root files) and confirm no extra nesting or renamed folders.

---

## **Phase 1 — Backend (FastAPI) Bootstrapping**

1. In `backend/`, scaffold a FastAPI app structured as `app/{main.py, core/{config.py,security.py}, db/{base.py,session.py}, models, schemas, api/{deps.py,v1/*}, services, tasks, utils}` with CORS enabled, pydantic-settings, and an uvicorn entrypoint; add `pyproject.toml` using `uv` or `poetry`.
2. Add PostgreSQL with SQLAlchemy 2.0 and Alembic plus a `docker-compose.yml` (postgres + pgadmin); after defining base models, generate the initial Alembic migration.
3. Implement `User` (uuid id, email unique, phone optional, role `merchant|customer|admin`, password_hash, created_at, last_login_at, soft delete) and email-only auth endpoints (register or login if exists) with JWT access + refresh.
4. Implement `Merchant` (uuid, owner_user_id FK, display_name, legal_name, logo_url, category, `location {lat,lng,address}`, is_active) and `Location` (multi-branch) with owner CRUD and public `GET /merchants/search?query=&near=lat,lng&radius_m=`.
5. Implement `LoyaltyProgram` created **only** by merchants (no defaults at signup): name, description, logic type (`punch_card|points`), JSON `earn_rule` and `redeem_rule`, terms, is_active; public reads + owner CRUD.
6. Implement `CustomerProgramMembership` and `LedgerEntry` (type `EARN|REDEEM|ADJUST`, amount/punches, tx_ref, device_fingerprint) and ensure every state change writes to the ledger.
7. Add QR join/stamp endpoints: merchant issues short-lived signed tokens (JWS, 90s TTL, nonce, location_id) and customer scans; enforce geofence ≤100m on server.
8. Implement redeem with balance checks, max value enforcement, atomic ledger `REDEEM` with idempotency key, returning a one-time cashier code (JTI) valid for 120s.
9. Anti-fraud: device fingerprint header, Redis single-use nonces, rate limits with slowapi, idempotency on earn/redeem, haversine distance checks, and basic anomaly metrics.
10. Tests: pytest for auth, QR sign/verify, join, earn, redeem, double-spend prevention with ≥85% coverage; wire tests into CI workflow.

---

## **Phase 2 — Shared UI Library & Design System**

1. In `packages/ui/`, create a Tailwind preset (color tokens, radius, shadows, typography) and React components (Button, Input, Card, Modal/Sheet, EmptyState, MapPinBadge) built on shadcn/ui + Radix; export `tailwind.config.preset.ts` with usage docs.
2. Configure both frontends to consume `packages/ui` via npm workspaces, applying the shared Tailwind preset, Inter/Geist fonts, Framer Motion, and accessibility defaults.

---

## **Phase 3 — Customer Frontend (PWA) Core**

1. In `customer-frontend/`, scaffold React + Vite + TS with Tailwind, shadcn/ui, and Framer Motion; set routes: `/`, `/auth`, `/dashboard`, `/programs/:id`, `/rewards`, `/profile`, `/map`.
2. Implement email-only auth to backend register/login; store JWT in IndexedDB (localforage) with axios refresh interceptors and error toasts.
3. Build Dashboard: joined programs (progress cards), QR Scan FAB, recent ledger feed, and a CTA to “Find nearby merchants.”
4. Implement `/map` with Leaflet/Mapbox GL using geolocation and `GET /merchants/search?near=lat,lng&radius_m=3000`; clicking a marker opens merchant info + available programs (joining still requires on-site QR).
5. Add QR Scanner (zxing/browser or jsQR) to parse join/stamp tokens and call `/qr/scan-join` or `/qr/scan-stamp`, handling expired/not-nearby/nonce-used errors.
6. Program page: show progress, terms, ledger (paginated), and “Redeem” that calls `POST /programs/{id}/redeem` and displays a 120-second code with countdown.
7. PWA offline: Workbox service worker, precache shell, background sync for failed **earn** submissions, block redeem offline, and show an offline banner; keep first load <150KB gzipped JS.
8. Profile page: edit name/photo, privacy toggles, device name (for fingerprint), theme (light/dark/system), and logout.

---

## **Phase 4 — Merchant Frontend (POS-Friendly)**

1. In `merchant-frontend/`, scaffold React + Vite + TS with Tailwind and shadcn/ui; routes: `/auth`, `/dashboard`, `/programs`, `/programs/new`, `/qr`, `/redemptions`, `/analytics`, `/settings`.
2. Implement merchant auth (email magic login) tied to `role=merchant`; store JWT and merchant context; redirect to dashboard.
3. Program Creator: form for name/description, logic type (punch_card/points), JSON editors for `earn_rule` and `redeem_rule`, preview card, submit to backend; **no default program at registration**.
4. QR Console: “Issue Join QR” and “Issue Stamp QR” with rotating signed tokens (auto-refresh ~60s), location selector, and optional purchase total for stamps.
5. Redemption Console: input redeem code → backend validation → mark consumed; display short audit trail for last 20 redeems.
6. Analytics: DAU/WAU/MAU, earned vs redeemed ratio, breakage %, top hours, anomaly alerts with Recharts via `/analytics` endpoints.
7. Staff roles: owner/manager/cashier with scoped permissions for QR issuing and redeem processing; invite staff by email.
8. Settings: merchant profile, location CRUD with map picker, logo upload, business hours, CSV export, and webhook placeholders.

---

## **Phase 5 — Security & Fraud Controls**

1. Collect device fingerprint (hashed tuple of UA + platform + screen + local salt) on both apps and send as a header on join/earn/redeem; store on each ledger entry and flag multi-device anomalies.
2. Enforce geofence (≤100m) for join/stamp with optional staff override token from merchant console; compute distance server-side using haversine.
3. Rate limits per IP and device for `scan-join`, `scan-stamp`, and `redeem`; opaque URL IDs (never expose raw UUIDs) using client ULIDs mapped server-side; QR payloads contain only signed claims.

---

## **Phase 6 — Monetization (B2B)**

1. Add `Plan` (Starter KES 990/mo, Pro KES 2990/mo) and `Subscription` (merchant_id, plan_id, status, period_start/end) with a 14-day trial; gate advanced analytics and multi-location under Pro.
2. Integrate Stripe (test) or mock billing: create checkout sessions from Settings, handle webhook `checkout.session.completed`, update `Subscription`, and show plan status banners and upgrade nudges.
3. Monthly email summaries via APScheduler/Cron with key metrics and upgrade CTA; per-merchant unsubscribe flag.

---

## **Phase 7 — Customer APK (Capacitor)**

1. Add Capacitor to `customer-frontend/` with Android app id `com.rudi.customer` and configure Camera, Geolocation, Secure Storage, and Splash permissions; verify QR scanner performance in WebView.
2. Add npm build script at root to build APK: `npm -w customer-frontend run build && npx cap sync android && ./android/gradlew assembleRelease`; create `docs/mobile_build.md` with signing + install steps.

---

## **Phase 8 — Observability, QA, and Docs**

1. Backend logging with structlog + request IDs + masked PII; Prometheus metrics; health endpoints `/healthz` and `/readyz`; multi-stage Dockerfile for backend.
2. Seed scripts to create demo merchants/locations/programs, 100 fake customers, and random earn/redeem flows; document `make seed` or Python CLI usage.
3. Playwright E2E tests for both frontends: auth, on-site join via QR, stamp, redeem, and offline/online transitions; run in CI with headless Chrome.
4. Documentation: `GETTING_STARTED.md`, `API_REFERENCE.md` (OpenAPI), `DATA_MODEL.md` (ERD), `REWARD_LOGIC.md` (earn/redeem invariants), `SECURITY.md` (JWS, nonces, TTLs, idempotency), and `RUNBOOK.md`.

---

## **Phase 9 — Hardening & Nice-to-Haves**

1. Background reconciliation comparing ledger totals vs program balances; auto-create `ADJUST` entries and admin alerts when mismatches detected.
2. Import/export: merchant CSV/JSON for memberships, ledger, and program definitions; customer CSV export of personal ledger.
3. Performance: multi-tenant composite indexes (`merchant_id` + `location_id`), sensible pagination defaults, and N+1 query guards.
4. Feature flags (env/DB) for experiments (NFC tap, promo multipliers); i18n scaffolding (default `en`, placeholder `sw-KE`) and translation pipeline.

---

## **Phase 10 — NPM Scripts & Commands (Quality of Life)**

1. At `RUDI APP/` root `package.json`, add scripts: `"build": "npm -w packages/ui run build && npm -w merchant-frontend run build && npm -w customer-frontend run build"`, `"dev:merchant": "npm -w merchant-frontend run dev"`, `"dev:customer": "npm -w customer-frontend run dev"`, `"test": "npm -w merchant-frontend test && npm -w customer-frontend test"`.
2. Update CI to use npm workspaces throughout (replace pnpm references) and ensure each job runs from the `RUDI APP/` root.
3. Document workspace usage in `README.md` with examples: `npm -w merchant-frontend run dev`, `npm -w customer-frontend run dev`, `npm -w packages/ui run build`, and `npm run build --workspaces`.

---

