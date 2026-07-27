# Shuraim Air Travel & Tours — Developer Guide

Onboarding reference for new developers. Read this top-to-bottom once; it explains what the
product is, how the code is organized, how to run it, and the few gotchas that will otherwise
cost you an afternoon.

---

## 1. What the product is

A **B2B flight-booking portal** for a travel consolidator ("Shuraim Air Travel & Tours").
It is **not** a consumer travel site — the customers are travel agencies.

Two roles:

- **Super Admin** — loads flight inventory, approves/blocks agencies, confirms bookings,
  verifies bank payments, manages airlines/groups/banks.
- **Agency** — registers (requires admin approval), searches flights, books seats, downloads
  PDF e-tickets, tracks a running account **ledger**, and submits payment proofs.

Core money flow: an agency books a flight → seats are reserved and the booking **debits** their
ledger → the agency pays into a bank account and uploads the reference → admin approves the
payment → it **credits** their ledger. Bookings can auto-expire/auto-sell via a scheduler.

---

## 2. Tech stack (at a glance)

| Layer | Tech |
|---|---|
| Frontend | React 18 (Create React App), React Router v6, **Tailwind CSS v3**, axios, react-icons, recharts |
| Backend | Node.js + **Express**, **Prisma ORM**, JWT auth, Multer (uploads), PDFKit + qrcode (e-tickets), Resend (email) |
| Database | **Supabase Postgres** (accessed via Prisma, not the Supabase JS client) |
| Hosting | Frontend → **Vercel** · Backend → **Render** · DB/Storage → **Supabase** |
| Language | JavaScript (no TypeScript) |

---

## 3. Repository layout

```
Shuraim-Travel-Agency/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js              # routes + role guards (AppShell wraps authed pages)
│   │   ├── index.css           # Tailwind directives + design tokens
│   │   ├── components/
│   │   │   ├── ui/             # ★ design-system component library (Button, Card, Table, Modal, Toast…)
│   │   │   ├── AppShell.jsx    # sidebar + topbar layout for authed pages
│   │   │   ├── AuthLayout.jsx  # split-screen shell for login/register
│   │   │   └── PrivateRoute.js # auth/role gate
│   │   ├── config/
│   │   │   ├── api.js          # API_BASE_URL + endpoint constants
│   │   │   └── axiosConfig.js  # axios instance: injects JWT, handles 401 logout
│   │   ├── pages/{auth,admin,agency}/  # one file per screen
│   │   └── styles/             # LEGACY per-page CSS (being deleted as pages migrate — see §9)
│   └── tailwind.config.js      # ★ design tokens (green palette, 2px corners)
│
├── server/                     # Express + Prisma backend  (the LIVE backend)
│   ├── src/
│   │   ├── app.js              # builds the Express app (helmet, cors, rate-limit, routes, errors)
│   │   ├── server.js           # app.listen() + starts scheduler + graceful shutdown
│   │   ├── config/             # env.js (fail-fast validation) + prisma.js (client singleton)
│   │   ├── middleware/         # auth, validate, upload, asyncHandler, ApiError, errorHandler
│   │   ├── modules/            # ★ one folder per domain: routes → controller → service
│   │   ├── services/           # emailService, pdfService, smsService, auditService
│   │   └── jobs/               # bookingScheduler (node-cron)
│   ├── prisma/
│   │   ├── schema.prisma       # ★ the data model (source of truth)
│   │   └── seed.js             # seeds a super-admin
│   ├── tests/                  # Jest + Supertest
│   └── ⚠️ api/ routes/ models/ controllers/  # LEGACY, DEAD CODE — see §8. Do NOT edit these.
│
├── DEVELOPER_GUIDE.md          # this file
├── MIGRATION_V2.md             # backend cutover checklist + legacy deletion list
└── DEPLOYMENT.md / README.md
```

The `★` items are where you'll spend most of your time.

---

## 4. Backend architecture

A single persistent Express service, layered per domain module. Every feature is a folder in
`server/src/modules/` containing:

- `*.routes.js` — HTTP routes; wires middleware (auth, validation) to the controller.
- `*.controller.js` — thin: reads `req`, calls the service, shapes the JSON response.
- `*.service.js` — business logic + all Prisma calls. **This is where the real work lives.**
- `*.validation.js` — express-validator rules (on write endpoints).

Modules: `auth`, `agency`, `flight`, `airline`, `group`, `bank`, `feedback`, `payment`,
`ledger`, `booking`, `ticket`, `dashboard`, `image`.

Cross-cutting pieces:

- **`config/env.js`** — validates required env vars at boot and **exits if any are missing**
  (no insecure fallbacks). Read env only from here, never `process.env` directly in modules.
- **`config/prisma.js`** — the one `PrismaClient` instance. Import this everywhere.
- **`middleware/auth.js`** — `authMiddleware` (verifies JWT → `req.user`), `adminOnly`, `agencyOnly`.
- **`middleware/asyncHandler.js`** — wrap async controllers so thrown errors reach the error handler.
- **`middleware/ApiError.js`** — throw `ApiError.badRequest('…')` etc.; the error handler turns it into a clean JSON status.
- **`services/pdfService.js`** — generates the e-ticket PDF (writes to `server/public/tickets`).
- **`jobs/bookingScheduler.js`** — node-cron; every 2 min moves `pending`→`hold` and auto-sells expired holds.

### The one piece to understand deeply: booking (`modules/booking/booking.service.js`)

Seat reservation is **concurrency-safe**. Instead of "read seats, then write", it does a
conditional `updateMany` inside a `prisma.$transaction`:

```
UPDATE flights SET seatsRemaining = seatsRemaining - n
WHERE id = ? AND status = 'active' AND seatsRemaining >= n
```

If that matches **0 rows**, the seats are gone and the booking is rejected. This prevents two
agencies from booking the last seat simultaneously (overbooking). There's a unit test for it
in `server/tests/booking.service.test.js`.

---

## 5. Data model (Prisma → Postgres)

Source of truth: `server/prisma/schema.prisma`. Tables (snake/lower plural via `@@map`):

- **Admin**, **Agency** (agencies have a `status`: pending/approved/rejected/blocked)
- **Flight** (route, times, `flightClass`, `group`, seats, `pricePerSeat`, status)
- **Booking** (`bookingId` string, `passengers` JSON, `status`: pending/hold/cancel_requested/cancelled/sold)
- **Airline**, **Group**, **Bank** — reference data; images stored as **DB BLOBs** (`Bytes`) and
  served via `/api/images/...` (see fast-follow in §10)
- **Payment** (agency → bank, with status approved/rejected)
- **Feedback**, **AuditLog**

> The **ledger is derived, not a table.** `modules/ledger` computes each agency's running balance
> on the fly from their bookings (debits, with refunds on cancellation) and approved payments (credits).

**Working with the schema:** edit `schema.prisma`, then:
```
npx prisma generate        # regenerate the client (also runs on npm install via postinstall)
npx prisma db push         # apply schema changes to the DB (dev)
npx prisma studio          # browse/edit data in a GUI
```

---

## 6. Frontend architecture

- **Routing** (`src/App.js`): public routes (landing, logins, register) render bare;
  authenticated routes are wrapped in `<Protected role="…">` which combines `PrivateRoute`
  (auth/role gate) + `AppShell` (sidebar/topbar).
- **Design system**: everything is Tailwind + a token set in `tailwind.config.js`
  (green brand `#106043`, forest `#04301F`, mint accent `#34D498`, **2px square corners**).
  Reusable components live in `src/components/ui/` — **use these, don't hand-roll**:
  `Button`, `Card`, `Input`/`Select`/`Textarea`/`FormField`, `Table`, `Modal`, `ConfirmDialog`,
  `Badge` (status pills), `StatCard`, `PageHeader`, `Skeleton`, `EmptyState`, `Tabs`,
  and `ToastProvider`/`useToast` (import from `components/ui`).
- **API calls**: always use `apiClient` from `src/config/axiosConfig.js`. It injects the JWT and,
  on a 401, clears the session and redirects to the right login. Never use bare `axios`/`fetch`.
- **Auth state**: on login, the token + user are stored in `localStorage`; `App.js` restores it on load.

### ⚠️ Frontend is a migration-in-progress
The UI is being rebuilt onto the new green design system **page by page**. Some pages are done
(landing, both logins, both dashboards, `AppShell`, `AuthLayout`); the rest still use the old
per-page CSS in `src/styles/*`. When you touch an unmigrated page, convert it to the `ui/`
components and delete its dead CSS import. Replace any `alert()`/`prompt()`/`window.confirm()`
with `useToast()` / `<ConfirmDialog>`.

---

## 7. Local setup

**Prereqs:** Node 18+ and npm. You need the Supabase DB connection strings and a JWT secret
(ask the team; they live in each host's env settings, not in git).

### Backend
```
cd server
npm install                      # postinstall runs `prisma generate`
cp .env.example .env             # then fill in the values (see below)
npx prisma db push               # only if setting up a fresh DB
npm run seed                     # creates a super-admin (set SEED_ADMIN_* env vars first)
npm run dev                      # nodemon on http://localhost:5000
# health check: GET http://localhost:5000/api/health  → {"status":"ok","db":"connected"}
npm test                         # Jest + Supertest (no live DB needed)
```

Required `server/.env` keys (values are secrets — get them from the team / host dashboard):
`DATABASE_URL` (Supabase pooled, port 6543, `?pgbouncer=true`), `DIRECT_URL` (port 5432),
`JWT_SECRET`, `CORS_ORIGINS`, and optionally `RESEND_API_KEY` / `EMAIL_FROM`.
> Gotcha: if your DB password contains special chars (`+`, `@`, …), **URL-encode them** in the
> connection string (`+` → `%2B`).

### Frontend
```
cd client
npm install
# point it at your backend:
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start                        # http://localhost:3000
```
Admin login for a seeded DB: `admin@shuraimtravel.com` / `Shuraim@2026` (change after first login).

---

## 8. ⚠️ Legacy code — do not touch

The backend was migrated from a broken half-Sequelize/half-serverless setup to the current
Express+Prisma app. The **old code is still in the repo but is dead**:

- `server/api/` (old Vercel serverless functions), `server/routes/`, `server/controllers/`,
  `server/models/` (Sequelize), `server/config/database.js`, `server/server.js` (empty stub),
  `server/vercel.json`.

Only `server/src/**` is live. The legacy folders are scheduled for deletion once the production
cutover is fully verified — see **`MIGRATION_V2.md`** for the deletion checklist. Don't add
features there and don't copy their patterns (they use Sequelize/`alert`-style code).

---

## 9. Conventions

- **Backend:** business logic in services, not controllers. Throw `ApiError.*`. Read config from
  `config/env.js`. Use the shared `prisma` client. Validate writes with express-validator.
- **Frontend:** compose from `components/ui/*`; Tailwind classes only (no new CSS files);
  2px corners (`rounded-sm`); call the API via `apiClient`; show loading with `Skeleton`,
  empty data with `EmptyState`, status with `Badge`, feedback with `useToast()`.
- **Commits:** work on a branch; the frontend must `npm run build` clean before merging.
- **Never commit secrets.** `server/.env` is gitignored; set real values in Render/Vercel/Supabase.

---

## 10. Deployment & environments

- **Backend (Render):** root dir `server`, start `npm start`; `prisma generate` runs on install.
  Set all env vars in the Render dashboard. Health path `/api/health`. Note: the free tier
  **sleeps after ~15 min idle** (first request then takes ~50s).
- **Frontend (Vercel):** set `REACT_APP_API_URL` to the Render URL, then redeploy. No code change
  needed — `config/api.js` reads that var.
- **DB (Supabase):** free projects **pause after ~1 week idle** — if the API can't reach the DB,
  check the Supabase dashboard and resume the project.

### Known fast-follows / tech debt
- Move airline/bank/group images and ticket PDFs from **DB BLOBs / local disk** to **Supabase
  Storage** (they currently won't survive horizontal scaling or a redeploy of the ticket folder).
- Finish migrating the remaining frontend pages onto the design system and delete `src/styles/*`.
- Delete the legacy backend folders (§8) after cutover sign-off.

---

## 11. Where to look first

| I want to… | Go to |
|---|---|
| Understand the data | `server/prisma/schema.prisma` |
| Add/adjust an API endpoint | `server/src/modules/<domain>/` |
| See how booking/seats work | `server/src/modules/booking/booking.service.js` |
| Change global styling/colors | `client/tailwind.config.js` |
| Reuse a UI component | `client/src/components/ui/` |
| Add a page/route | `client/src/App.js` + `client/src/pages/` |
| Trace a frontend API call | `client/src/config/axiosConfig.js` + `config/api.js` |
| Cutover / deletion plan | `MIGRATION_V2.md` |
```
