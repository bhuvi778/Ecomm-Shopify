# GMT MART — Vercel Deployment Guide

This is a **monorepo** with two apps. Deploy each as its own Vercel project.

```
Ecomm/
├── backend/    →  Vercel project #1  (Node.js serverless API)
└── frontend/   →  Vercel project #2  (Vite SPA)
```

---

## 1. Prerequisites

- A free **MongoDB Atlas** cluster (Vercel cannot host MongoDB itself).
  - Create one at https://cloud.mongodb.com → "Build a Database" → Free tier.
  - Add a database user, then whitelist `0.0.0.0/0` under Network Access.
  - Copy the connection string (starts with `mongodb+srv://...`).
- A **Vercel** account: https://vercel.com (sign in with GitHub).

---

## 2. Deploy the BACKEND

1. Vercel Dashboard → **Add New → Project** → import `bhuvi778/Ecomm-Shopify`.
2. **Root Directory:** `backend`
3. **Framework preset:** Other  
   **Build Command:** *(leave empty)*  
   **Output Directory:** *(leave empty)*  
   **Install Command:** `npm install`
4. **Environment Variables** (add all three):
   | Key             | Value                                                     |
   | --------------- | --------------------------------------------------------- |
   | `MONGO_URI`     | your MongoDB Atlas connection string                      |
   | `JWT_SECRET`    | a long random string (e.g. `openssl rand -hex 32`)        |
   | `CLIENT_ORIGIN` | will set after frontend deploy — for now: `*`             |
5. Click **Deploy**. Note the URL, e.g. `https://gmt-mart-backend.vercel.app`.
6. Test: open `https://<your-backend>.vercel.app/api/health` → should return `{"status":"ok"}`.

### Seed the database (one-time)

Run locally with the Atlas URI:
```powershell
cd backend
$env:MONGO_URI="mongodb+srv://..."
npm run seed
```

---

## 3. Deploy the FRONTEND

1. Vercel Dashboard → **Add New → Project** → import the same repo again.
2. **Root Directory:** `frontend`
3. **Framework preset:** Vite (auto-detected)  
   **Build Command:** `npm run build`  
   **Output Directory:** `dist`
4. **Environment Variables:**
   | Key             | Value                                          |
   | --------------- | ---------------------------------------------- |
   | `VITE_API_URL`  | `https://<your-backend>.vercel.app/api`        |
5. Click **Deploy**. Note the URL, e.g. `https://gmt-mart.vercel.app`.

---

## 4. Wire the two together

Go back to the **backend** project → Settings → Environment Variables → update:

```
CLIENT_ORIGIN = https://<your-frontend>.vercel.app
```

Then **Redeploy** the backend (Deployments → ⋯ → Redeploy).

---

## 5. Verify

- Open `https://<your-frontend>.vercel.app`
- Register a new user → should get a Rs.1000 welcome voucher
- Place a test order → 20% auto-discount should apply
- Login as admin (default seed: `admin@gmtmart.com` / `admin123` — change in seed file)

---

## Local development (unchanged)

```powershell
# Terminal 1 — backend
cd backend
npm install
npm run dev          # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Vite still proxies `/api` → `localhost:5000` in dev (no `VITE_API_URL` needed).

---

## Common issues

- **CORS error in browser** → backend `CLIENT_ORIGIN` must exactly match the frontend URL (no trailing slash). Multiple origins can be comma-separated.
- **502 / function crashed** → check Vercel function logs; usually a missing env var or an Atlas IP-whitelist issue (`0.0.0.0/0` must be allowed).
- **Cold start slow** → first request after idle ~2 s; subsequent requests are fast. This is normal for serverless.
- **Mongo "buffering timed out"** → `MONGO_URI` is wrong or Atlas is blocking the IP.
