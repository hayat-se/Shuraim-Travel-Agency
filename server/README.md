# Shuraim Travel Agency — Backend (v2: Express + Prisma)

A single, persistent Express API backed by Prisma on Supabase Postgres. This replaces
the previous mix of dead Sequelize/MySQL code and scattered Vercel serverless functions.

## Architecture

```
src/
├── app.js                 # builds the Express app (helmet, cors, compression, rate-limit, routes, error handler)
├── server.js              # app.listen() + starts the booking scheduler + graceful shutdown
├── config/                # env (fail-fast validation) + prisma client singleton
├── middleware/            # auth (JWT), validate, upload (multer), asyncHandler, ApiError, errorHandler
├── modules/               # one folder per domain: routes → controller → service (→ Prisma)
│   ├── auth/  agency/  flight/  airline/  group/  bank/
│   ├── feedback/  payment/  ledger/  booking/  ticket/  dashboard/  image/
├── services/              # emailService, pdfService, smsService, auditService
└── jobs/                  # bookingScheduler (node-cron)
prisma/
├── schema.prisma          # data model (verify with `prisma db pull` against the live DB)
└── seed.js                # seeds a super-admin
tests/                     # Jest + Supertest
```

Each module keeps its `*.routes.js` (HTTP wiring), `*.controller.js` (thin req/res), and
`*.service.js` (business logic + Prisma). Money/seat operations run inside `prisma.$transaction`.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env` and fill in:
   - `DATABASE_URL` — Supabase → Settings → Database → Connection string (pooled, port 6543, `?pgbouncer=true`)
   - `DIRECT_URL` — the direct connection (port 5432), used by `prisma db pull`/`migrate`
   - `JWT_SECRET` — **required**, long random string (`openssl rand -base64 48`)
   - `CORS_ORIGINS` — your frontend origin(s), comma-separated
   - `RESEND_API_KEY`, `EMAIL_FROM` — for transactional email (optional; degrades gracefully)
3. Reconcile Prisma with the live schema (the schema was authored from the legacy models):
   ```
   npx prisma db pull --print   # inspect diffs vs prisma/schema.prisma
   npx prisma generate
   ```
4. (First time) seed a super-admin:
   ```
   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='StrongPass!' npm run seed
   ```
5. Run: `npm run dev` (nodemon) or `npm start`. Health check: `GET /api/health`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start (production) |
| `npm test` | Jest + Supertest (no live DB needed) |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:pull` | Introspect the live DB into `schema.prisma` |
| `npm run prisma:studio` | Browse data |
| `npm run seed` | Seed super-admin |

## API surface (paths unchanged — the frontend needs no route changes)

- Auth: `POST /api/auth/admin/login`, `/agency/register`, `/agency/login`, `/agency/password/otp`, `/agency/password/reset`
- Agencies (admin): `GET /api/admin/agencies`, `/pending`; `PUT /api/admin/agencies/:id/{approve,reject,block,unblock}`
- Flights: `GET /api/admin/flights`, `/search`, `/:id`, `/:id/availability`; admin `POST/PUT/DELETE`
- Airlines: `GET /api/airlines/active`, `/admin`; admin `POST/PUT/DELETE /api/airlines/admin[/:id]`
- Groups: `GET /api/groups`, `/admin`; admin `POST/PUT /api/groups/admin[/:id]`
- Banks: `GET /api/banks`, `/admin`; admin `POST/PUT/DELETE /api/banks/admin[/:id]`
- Feedback: agency `POST /api/feedback`, `GET /my`; admin `GET /admin`, `PUT /admin/:id`
- Payments: agency `POST /api/payments`, `GET /my`; admin `GET /admin`, `PUT /admin/:id/status`
- Ledger: `GET /api/ledger/my`
- Bookings: `POST /api/bookings`, `/guest`; `GET /my-bookings`, `/` (admin), `/:id`; `PUT /:id/{update,confirm,cancel}`
- Tickets: `GET /api/tickets/download/:bookingId`, `/:bookingId`
- Dashboard: `GET /api/dashboard/admin/stats`, `/agency/stats`
- Images: `GET /api/images/{airlines,groups,banks}/:id`

## Deployment (Railway / Render / Fly)

- Start command: `npm start` (runs `node src/server.js`).
- Ensure `prisma generate` runs on install (add `"postinstall": "prisma generate"` if your host doesn't).
- Set all env vars from `.env.example` in the host dashboard.
- The booking scheduler runs in-process (node-cron) — no external cron needed.

## Security notes

- App refuses to boot without `JWT_SECRET` / `DATABASE_URL` (no insecure fallbacks).
- CORS is an allowlist (`CORS_ORIGINS`); fails closed in production.
- Global rate limit + stricter limiter on `/api/auth/*`.
- `helmet`, `compression`, request-size limits enabled.
- Agency endpoints scope by `req.user.id`; password hashes are never returned.

## Known fast-follows

- Move airline/bank/group images and ticket PDFs from DB BLOB / local disk to **Supabase Storage**.
- See `../MIGRATION_V2.md` for the cutover + legacy-deletion checklist.
