# Rudi Loyalty App

A full-stack digital loyalty punch-card system with separate merchant and customer frontends, a FastAPI backend, QR-based program logic, anti-fraud protection, and mobile packaging.

## Workspace Layout

This project uses npm workspaces for monorepo management. The structure is as follows:

- `backend/` — FastAPI backend with PostgreSQL
- `merchant-frontend/` — React + Vite frontend for merchants
- `customer-frontend/` — React + Vite PWA frontend for customers
- `packages/ui/` — Shared UI library with Tailwind + shadcn/ui components

## Getting Started

All commands should be run from the root `RUDI APP/` directory.

### Development

- Start merchant frontend: `npm -w merchant-frontend run dev`
- Start customer frontend: `npm -w customer-frontend run dev`
- Build shared UI: `npm -w packages/ui run build`
- Build all: `npm run build`

### Installation

1. Ensure Node.js >=18 is installed.
2. Run `npm install` in the root directory to install dependencies for all workspaces.

## License

MIT License - see LICENSE file for details.