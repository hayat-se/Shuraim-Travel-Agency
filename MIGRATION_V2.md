# Backend v2 Migration — Cutover Checklist

The backend was rebuilt as a single persistent **Express + Prisma** service under
`server/src/` (see `server/README.md`). The old dead code is **left in place on
purpose** — the legacy `server/api/*` serverless functions are still your current
production backend. Do the cutover in order; only delete legacy code at the end,
after the new service is verified.

## 1. Provision & configure
- [ ] Get the Supabase Postgres connection strings (Settings → Database).
- [ ] In `server/.env`: set `DATABASE_URL` (pooled, 6543, `?pgbouncer=true`), `DIRECT_URL`
      (5432), a strong `JWT_SECRET`, and `CORS_ORIGINS` (your frontend origin).
- [ ] `cd server && npm install`

## 2. Reconcile the schema with the live DB
The Prisma schema was authored from the legacy Sequelize models. Confirm it matches reality:
- [ ] `npx prisma db pull --print` — review any differences (column names, types, enums).
- [ ] Adjust `prisma/schema.prisma` if the live DB differs, then `npx prisma generate`.
- [ ] `npx prisma studio` — sanity-check that tables/rows load.

## 3. Verify locally
- [ ] `npm test` — should pass (routing/auth/validation + overbooking guard).
- [ ] `npm run dev`, then `GET http://localhost:5000/api/health` → `{ status: "ok", db: "connected" }`.
- [ ] Seed an admin if needed: `SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run seed`.
- [ ] Point the frontend at the local API: create `client/.env` with
      `REACT_APP_API_URL=http://localhost:5000`, run `npm start`, and exercise:
      admin login → create flight; agency login → search → book → download e-ticket → ledger;
      admin dashboard stats + all-bookings.

## 4. Deploy the new backend
- [ ] Deploy `server/` to Railway/Render/Fly (start: `npm start`; ensure `prisma generate` runs on install).
- [ ] Set all env vars in the host. Confirm `/api/health` on the deployed URL.

## 5. Cut the frontend over
- [ ] Set `REACT_APP_API_URL` to the new backend URL in the frontend's hosting env
      (Vercel → Project → Settings → Environment Variables). No code change needed —
      `client/src/config/api.js` already reads this var.
- [ ] Redeploy the frontend. Smoke-test the full flow in production.

## 6. Delete legacy code (only after step 5 is confirmed working)
Once the new backend serves all traffic, remove the superseded code:
- [ ] `server/api/` (old serverless functions)
- [ ] `server/routes/`, `server/controllers/`, `server/models/`
- [ ] `server/config/config.js`, `server/config/database.js`, `server/models/database.js`
- [ ] `server/services/*` legacy copies now living under `server/src/services/`
- [ ] `server/middleware/*` legacy copies now under `server/src/middleware/`
- [ ] `server/server.js` (empty stub) and `server/vercel.json`
- [ ] Root `vercel.json` API build config (keep only what the frontend deploy needs)
- [ ] Remove `serverless-http`, `sequelize`, and `@supabase/supabase-js` from deps if
      Supabase Storage is not yet used.

## 7. Fast-follows (post-cutover)
- [ ] Move images (airline/bank/group BLOBs) and ticket PDFs to **Supabase Storage** + signed URLs.
- [ ] Add per-route integration tests against a Supabase test branch.
- [ ] Then begin the Phase-2 feature roadmap (wallet, markup engine, reporting) from the plan.
