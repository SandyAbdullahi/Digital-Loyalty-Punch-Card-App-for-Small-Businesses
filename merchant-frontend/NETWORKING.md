# Merchant Frontend Networking & Mobile Access

This app uses Vite + Axios and assumes a separate FastAPI backend. By default, the frontend talks to `http://localhost:8000`, which only works on the same machine. To use the merchant app from your phone or other devices on your LAN, you must bind both frontend and backend to your LAN IP and point `VITE_API_URL` at that IP.

## 1. Run the backend on all interfaces

From the repo root (or `backend` folder), start FastAPI / uvicorn like this:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Then from your dev machine, verify:

```bash
curl http://localhost:8000/health
```

From your phone (on the same Wi‑Fi), open:

```text
http://<YOUR_LAN_IP>:8000/health
```

Example: `http://192.168.100.3:8000/health` should return `{"status": "ok"}`. If it doesn’t, check OS firewall or router rules for port `8000`.

## 2. Configure frontend API base URL

The merchant frontend reads `VITE_API_URL` for Axios:

```ts
// merchant-frontend/src/config/api.ts
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Create `merchant-frontend/.env` by copying the example and replacing the IP with your dev machine’s LAN IP:

```bash
cd merchant-frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://192.168.100.3:8000
```

(Use your actual LAN IP address instead of `192.168.100.3`.)

## 3. Run the Vite dev server for LAN

Start the merchant app with host binding so other devices can reach it:

```bash
cd merchant-frontend
npm run dev -- --host 0.0.0.0 --port 3001
```

Now you can open the app:

- On dev machine: `http://localhost:3001`
- On phone/tablet: `http://<YOUR_LAN_IP>:3001` (e.g. `http://192.168.100.3:3001`)

All API calls will go to `http://<YOUR_LAN_IP>:8000` because of `VITE_API_URL`, so login and other features work across devices.

## 4. CORS configuration

FastAPI already enables permissive CORS:

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If you later tighten CORS, make sure to include both the dev and LAN origins, for example:

```env
BACKEND_CORS_ORIGINS=http://localhost:3001,http://192.168.100.3:3001
```

## 5. Quick checklist when you see `Network Error`

- [ ] Backend reachable from phone: `http://<LAN_IP>:8000/health`
- [ ] `merchant-frontend/.env` has `VITE_API_URL=http://<LAN_IP>:8000`
- [ ] `npm run dev -- --host 0.0.0.0 --port 3001` is running
- [ ] Phone is on the same Wi‑Fi subnet as dev machine

Once all four are true, the merchant app should work from other devices without Axios `Network Error` on login.

