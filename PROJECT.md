# Bowled — Project Documentation

> Daily meal subscription for students in Chennai PGs, hostels and rented rooms.
> A venture by **Sree Krishna Catering**, launched May 5, 2025.

This document is the full picture: what's built, how it's wired, how to run it, and what to build next.

---

## 1. Status snapshot

End-to-end is **working against a real MongoDB Atlas cluster**. A user can sign up, get a JWT, create a subscription, skip meals/days; an admin can log in and see those skip events live.

| Surface | Status |
|---|---|
| Marketing site (Home, Plans, FAQ) | ✅ Done |
| Auth (signup + login + OTP) | ✅ API-backed, JWT, **real SMS via MSG91**, **rate-limited** (mock fallback in dev) |
| Subscription (plan + billing cycle + skips) | ✅ Persisted to Mongo |
| QR meal pass + scan | ✅ Persisted |
| Skip a meal / Skip a day | ✅ With cutoff rules, notification to admin |
| Admin Overview / Subscribers / Deliveries | ✅ Reading from Mongo |
| Payments | ❌ Not started |
| Real SMS OTP | ✅ MSG91 wired (`/api/auth/otp/{send,verify}`) |
| Group joining (multiple users → same group code) | ✅ Public lookup + auto-join + groupSize recompute |
| Email notifications | ❌ Not started |
| Production deploy | ❌ Local dev only |

---

## 2. Architecture

```
┌──────────────────────────┐        proxy /api/*        ┌──────────────────────────┐
│ Vite dev server  :5173   │ ─────────────────────────▶ │ Express 5 API     :4000  │
│ React 19 + Tailwind v4   │ ◀───────── JSON ────────── │ + JWT middleware         │
│ JWT in localStorage      │                            │ + Mongoose 8             │
└──────────────────────────┘                            └────────────┬─────────────┘
                                                                     │
                                                                     ▼
                                                        ┌──────────────────────────┐
                                                        │ MongoDB Atlas (cluster0) │
                                                        │ collections: users,      │
                                                        │ subscriptions,           │
                                                        │ skipnotifications,       │
                                                        │ kitchens                 │
                                                        └──────────────────────────┘
```

**Stack**

- **Frontend** · React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · React Router 7
- **Backend** · Node 22 · Express 5 · Mongoose 8 · jsonwebtoken · bcryptjs · tsx (dev runner)
- **Database** · MongoDB Atlas (free tier)
- **Auth** · JWT (HS256, 30-day expiry), stored in `localStorage`. Mock OTP for development (real SMS not wired).

---

## 3. Repository layout

```
c:\Krishna_foods\
├── .env                       # mongo_db_uri (and any overrides you add)
├── avast-root.pem             # Avast Antivirus root cert (see §10)
├── index.html
├── package.json               # frontend + orchestration scripts
├── vite.config.ts             # dev proxy /api → :4000
├── PROJECT.md                 # ← this file
├── DESIGN.md                  # design system / palette / typography
├── README.md                  # short entry-point
│
├── server/                    # backend (own package.json + node_modules)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Express app bootstrap
│       ├── config.ts          # env loading
│       ├── db.ts              # Mongoose connect
│       ├── seed.ts            # `npm run seed`
│       ├── lib/
│       │   ├── jwt.ts         # sign/verify
│       │   └── skip.ts        # cutoff math (mirrors src/lib/skip.ts)
│       ├── middleware/
│       │   ├── auth.ts        # requireAuth, requireAdmin
│       │   └── error.ts       # HttpError, errorHandler
│       ├── models/
│       │   ├── User.ts
│       │   ├── Subscription.ts
│       │   ├── SkipNotification.ts
│       │   └── Kitchen.ts
│       └── routes/
│           ├── auth.ts        # /api/auth/*
│           ├── me.ts          # /api/me
│           ├── subscription.ts# /api/subscription/*
│           └── admin.ts       # /api/admin/*
│
└── src/                       # frontend
    ├── App.tsx · main.tsx · router.tsx
    ├── index.css
    ├── context/
    │   ├── AuthContext.tsx        # token + user, calls /api/auth + /api/me
    │   ├── SubscriptionContext.tsx# CRUD + skip mutations
    │   └── AdminContext.tsx       # /api/admin/* + polling for skip events
    ├── lib/
    │   ├── api.ts             # fetch wrapper with JWT header
    │   ├── auth.ts            # sendOtp / verifyOtp
    │   ├── skip.ts            # SKIP_LIMITS, cutoff helpers (UI source of truth)
    │   ├── format.ts · cn.ts · storage.ts · constants.ts
    │   └── admin.ts           # ADMIN_PHONES list (used only for hint copy)
    ├── data/                  # static content (plans, menu, faq, testimonials)
    ├── components/
    │   ├── ui/                # Button, Card, Badge, Container, Section, ...
    │   ├── layout/            # Navbar, Footer
    │   ├── auth/              # AuthShell, PhoneInput, OtpInput
    │   ├── app/               # AppShell, Sidebar, BottomNav, TopBar, nav
    │   ├── admin/             # AdminSidebar
    │   └── sections/          # landing-page sections
    └── pages/
        ├── Home.tsx
        ├── auth/              # Login, Signup, Otp
        ├── app/               # Dashboard, MenuPage, QrPass, SubscriptionPage,
        │                      # SkipMeals, Profile
        └── admin/             # Overview, Subscribers, SubscriberDetail,
                               # Deliveries, MenuEditor, Kitchens
```

---

## 4. Environment variables

`./.env` (project root):

```env
# Required
mongo_db_uri=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0

# Required in production · highly recommended in dev — real SMS OTP via MSG91
MSG91_API_KEY=<authkey>
MSG91_TEMPLATE_ID=<template>
MSG91_SENDER_ID=BOWLED                     # optional; 6-char DLT-approved sender
MSG91_COUNTRY_CODE=91                      # default 91 (India)

# Optional — sensible defaults if unset
PORT=4000
JWT_SECRET=bowled-dev-secret-change-me     # MUST be set in production
JWT_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
ADMIN_PHONES=9360113501                    # comma-separated; these users get isAdmin: true on signup
NODE_ENV=development                       # set to "production" in deploys
```

**Production must set** `JWT_SECRET` to a strong random value **and** `MSG91_API_KEY` + `MSG91_TEMPLATE_ID`. The server refuses to start in production with either the default JWT secret or MSG91 credentials missing.

**Mock OTP fallback (dev only):** when `MSG91_API_KEY` and `MSG91_TEMPLATE_ID` are both blank, the server falls back to a deterministic OTP — `<last-4-of-phone>00` — and returns it in the `/api/auth/otp/send` response so the flow stays testable without a SIM card.

**OTP visibility in dev:** when MSG91 is enabled, the server generates the OTP itself (rather than letting MSG91 auto-generate), hands it to MSG91 to SMS, and logs it to the **server console** (never to the API response). This means if the SMS never arrives — e.g., your MSG91 account is in trial mode, a DLT operator is dropping it, or there's a carrier-side filter — you can still copy the OTP from the server log and sign in. The log line looks like `[msg91] OTP for 9876543210 = 2235`.

**Frontend env** (`.env` is shared, Vite reads `VITE_*` vars):

```env
VITE_API_URL=                              # leave empty in dev (proxy handles it); set to https://api.bowled.in in prod
```

---

## 5. Running locally

### One-time setup

```powershell
# Install both workspaces (root frontend + server backend)
npm install --strict-ssl=false
npm --prefix server install --strict-ssl=false
```

> `--strict-ssl=false` is needed because Avast Antivirus is intercepting HTTPS on this machine (see §10). On clean machines you don't need the flag.

### Seed the database

```powershell
npm run seed
```

Creates: 4 kitchens, 24 demo subscribers (with subscriptions), admin user(s) from `ADMIN_PHONES`.
Re-runnable: wipes only seeded subscribers (phones starting with `7`) and upserts the admin.

### Run everything

```powershell
# Recommended — both servers, one terminal
npm run dev:all

# Or separately:
npm run dev:server          # API on http://localhost:4000
npm run dev                 # Frontend on http://localhost:5173
```

### Build for production

```powershell
npm run build               # frontend → dist/
npm run build:server        # server → server/dist/
```

### Sign-in

With **MSG91 configured** (default in this repo), the OTP arrives on your real phone. Use any 10-digit Indian mobile starting 6/7/8/9.

With **MSG91 unconfigured** (delete the keys from `.env` for offline dev), the server falls back to the deterministic mock and returns the OTP in the `/send` response. The mock rule is **last 4 digits of phone + "00"** — e.g., `9876543210` → OTP `321000`. Admin demo phone `9360113501` → OTP `350100`.

---

## 6. Data model

### `users`
```ts
{ _id, phone (unique), name, email?, isAdmin,
  address: { line1, area, city },
  pgName, allergens, parentReport, notifications, rating,
  createdAt, updatedAt }
```

### `subscriptions`
```ts
{ _id, userId (unique ref User),
  planId: 'solo' | 'squad' | 'floor',
  billingCycleId: 'weekly' | 'weekly-no-sun' | 'monthly-no-sun' | 'monthly-no-weekend',
  groupCode, groupSize,
  startedAt, cycleStartedAt,
  totalMeals, mealsServed,
  status: 'active' | 'paused' | 'churned',
  today: { breakfast, lunch, dinner: 'pending' | 'served' | 'skipped' },
  history: [{ scannedAt, day, slot, mealName }],   // last 50
  pause: { from, to } | null,
  mealSkips: [{ id, date, slot, requestedAt }],
  daySkips:  [{ id, date,       requestedAt }] }
```

### `skipnotifications`
```ts
{ _id, kind: 'meal' | 'day',
  userId, subscriberName, groupCode,
  date, slot?, requestedAt,
  createdAt, updatedAt }
```

### `kitchens`
```ts
{ _id, code (unique), name, area, chef, chefPhone,
  capacityPerDay, todaysLoad, rating, specialty,
  fssaiGrade: 'A' | 'B' }
```

### Static (not in Mongo — lives as code)

- **Plans** — `src/data/plans.ts` (Solo / Squad / Floor)
- **Billing cycles** — `src/data/plans.ts` (`BILLING_CYCLES`)
- **Weekly menu** — `src/data/menu.ts`
- **FAQ, testimonials** — `src/data/{faq,testimonials}.ts`

---

## 7. API reference

All JSON. Auth header: `Authorization: Bearer <jwt>`. Error shape: `{ error: string, details?: { reason?: string } }`.

### Health
- `GET /api/health` — service info

### Auth (no auth required)
- `POST /api/auth/otp/send` — `{ phone }` → `{ ok, demoOtp }`
- `POST /api/auth/otp/verify` — `{ phone, otp, name? }` → `{ token, isNewUser, user }`
  - `name` is required for signup; if user exists, ignored

### Me (auth required)
- `GET  /api/me` → `{ user }`
- `PATCH /api/me` — partial User → `{ user }`. Allowed fields: name, email, address, pgName, allergens, parentReport, notifications

### Subscription (auth required)
- `GET  /api/subscription` → `{ subscription }` (or null)
- `POST /api/subscription` — `{ planId, billingCycleId?, groupSize?, groupCode? }` → `{ subscription }`
- `DELETE /api/subscription` — cancel
- `POST /api/subscription/scan` — `{ slot?, mealName? }` → marks meal served, increments history
- `POST /api/subscription/skip-next` — marks next pending slot as skipped (no skip-allowance impact)
- `POST /api/subscription/pause` — `{ fromIso, toIso }`
- `POST /api/subscription/resume`
- `POST /api/subscription/skip-meal` — `{ date, slot }` → enforces cutoffs + 5/cycle limit; creates SkipNotification
- `POST /api/subscription/skip-day` — `{ date }` → enforces cutoffs + 3/cycle limit; creates SkipNotification; clears any meal-skips on that date
- `DELETE /api/subscription/skips/meal/:id` — undo
- `DELETE /api/subscription/skips/day/:id`  — undo

Error reasons surfaced on skip endpoints: `not-monthly`, `past-date`, `cutoff-passed`, `limit-reached`, `duplicate`.

### Group (public — no auth)
- `GET /api/group/:code` → `{ group: { groupCode, planId, billingCycleId, groupSize, area, members: [{firstName, joinedAt}] } }` — used by signup to preview a group before joining. Returns first names only; no other PII leaked.

### Admin (auth + isAdmin required)
- `GET  /api/admin/overview` → `{ kpis, kitchens, skipNotifications }`
- `GET  /api/admin/subscribers` → `{ subscribers }`
- `GET  /api/admin/subscribers/:id` → `{ subscriber }`
- `GET  /api/admin/kitchens` → `{ kitchens }`
- `GET  /api/admin/skip-notifications` → `{ skipNotifications }`
- `PATCH /api/admin/subscribers/:id/status` — `{ status: 'active' | 'paused' | 'churned' }`

---

## 8. Skip-meal feature reference

Constants — `src/lib/skip.ts` (frontend) and `server/src/lib/skip.ts` (must stay in sync).

| Type | Per cycle | Cutoff |
|---|---|---|
| Meal skip | **5** | depends on slot ↓ |
| Full-day skip | **3** | by **end of previous day** |

| Slot | Confirm by |
|---|---|
| Breakfast | **9 PM the day before** |
| Lunch | **9 AM same day** |
| Dinner | **12 PM (noon) same day** |

- Feature is **monthly-only** (`billingCycleId.startsWith('monthly')`).
- Day skip supersedes any meal skips already on that date (server clears them).
- Undoing a skip removes the corresponding `SkipNotification`.
- The `SkipMeals` page picks the **earliest valid date** dynamically per active tab/slot.

---

## 9. Auth flow (end-to-end)

```
[Signup page]
  pick plan, enter name + phone → POST /api/auth/otp/send → demoOtp returned

[OTP page]
  enter otp → POST /api/auth/otp/verify { phone, otp, name }
    → server creates User if new
    → returns { token, user }
  → frontend: setToken(token); setUser(user)
  → if signup mode, also POST /api/subscription { planId, billingCycleId, groupSize }
  → navigate /app/home

[Subsequent loads]
  AuthContext mounts → if token in localStorage, GET /api/me to rehydrate
  SubscriptionContext mounts → GET /api/subscription
```

---

## 10. Known dev-env quirks

### Avast Antivirus TLS interception

This machine has Avast Web/Mail Shield enabled, which intercepts HTTPS with its own root CA. That broke:
- `npm install` (worked around with `--strict-ssl=false`)
- Mongoose's TLS connection to Atlas

**Resolution**: the Avast root was exported from the Windows trust store to `./avast-root.pem`. The server scripts set `NODE_EXTRA_CA_CERTS=../avast-root.pem` via `cross-env` so Node trusts it. **No security weakening — this is the same cert the OS already trusts.**

For teammates on machines **without** Avast, that file simply doesn't exist; Node logs a warning at startup and uses its default CA bundle (which works for normal Atlas TLS). So nothing breaks.

To regenerate the cert (e.g., after Avast renews it):

```powershell
$c = Get-ChildItem Cert:\LocalMachine\Root, Cert:\CurrentUser\Root |
     Where-Object { $_.Subject -like "*Avast*" } | Select-Object -First 1
$b64 = [Convert]::ToBase64String($c.Export('Cert'), 'InsertLineBreaks')
"-----BEGIN CERTIFICATE-----`n$b64`n-----END CERTIFICATE-----" |
  Set-Content -Path .\avast-root.pem -Encoding ascii
```

### Mongo creds in plaintext `.env`

`.env` currently has the Atlas connection string with embedded password. **Before pushing to git**, add `.env` to `.gitignore` and rotate the password (Atlas → Database Access → edit user).

---

## 11. Next steps — prioritized

### 🔴 P0 — required before any non-dev user
1. ~~**Real SMS OTP provider**~~ ✅ **Done.** MSG91 wired — `server/src/lib/msg91.ts`. Production won't start without `MSG91_API_KEY` + `MSG91_TEMPLATE_ID`. `demoOtp` is only ever returned in the dev mock fallback.
2. ~~**Rate-limit auth endpoints**~~ ✅ **Done.** `server/src/middleware/rateLimit.ts` — per-IP 10/min on all `/otp/*`, per-phone 3/hour on `/otp/send` (SMS-budget guard), per-phone 10/hour on `/otp/verify` (brute-force guard). In-memory store; swap to `rate-limit-redis` if we ever scale horizontally.
3. ~~**Stronger input validation**~~ ✅ **Done.** `zod` schemas at `server/src/lib/schemas.ts`, parsed via `parseBody(schema, req)` helper. Bad input returns `{ error, details: { fieldErrors } }` for inline form errors. Routes refactored: auth, me, subscription, admin.
4. ~~**Secrets hygiene**~~ ✅ **Code-side done.** `.env` added to `.gitignore` along with `*.pem`. `.env.example` shipped. Strong `JWT_SECRET` (96-char hex) generated and set. **You still need to rotate the Mongo password and MSG91 API key** — both were visible in this conversation. See README for steps.

### 🟠 P1 — production readiness
5. **Payments** — integrate Razorpay (UPI + cards). Order on subscription creation; webhook to confirm; only flip `status: 'active'` after `payment.captured`.
6. **Email** — Resend / Postmark for: signup welcome, subscription confirmation, parent report, skip confirmation.
7. ~~**Group joining flow**~~ ✅ **Done.** Public `GET /api/group/:code` lookup. Signup page has a "I have a group code" toggle that verifies + previews the group before sign-up. `POST /api/subscription` with a `groupCode` inherits the group's plan + billing cycle (client values are ignored) and recomputes `groupSize` across every member. Dashboard shows "X of Y members · N more to unlock" with a progress bar.
8. **Deliveries collection** — daily cron generates `deliveries` from active subscriptions × menu; admin "Run sheet" reads from there; per-delivery status updates persisted.
9. **Logging + monitoring** — Pino for structured logs, Sentry (or PostHog) on both ends for errors + funnel.
10. **CORS allow-list per env** — currently `CORS_ORIGIN` is a single value; switch to a list.

### 🟡 P2 — nice-to-haves
11. **Tests** — Vitest for `lib/skip.ts` cutoff math (critical), supertest for API routes.
12. **CI/CD** — GitHub Actions: type-check + build on PR; deploy on main.
13. **Hosting** — Vercel for frontend, Railway / Render / Fly for API; Atlas already production-grade. Map api.bowled.in → Railway, app.bowled.in → Vercel.
14. **Refresh tokens** — current JWT is 30d. Add a refresh-token rotation flow with httpOnly cookie if longer sessions are needed.
15. **Admin actions audit log** — admin pausing a subscriber, changing menu, etc. should produce an audit row.
16. **WhatsApp notifications** — Indian audience expects WA over email; cheaper than SMS.

### 🟢 P3 — polish
17. **i18n** — Tamil/Hindi toggle for the marketing site.
18. **PWA + push** — installable app + push notifications for tomorrow's menu.
19. **Referral system** — invite-a-friend → both get a free meal.
20. **Real chef photos / kitchen tour** — currently emoji-only on KitchenTrust.

---

## 12. Quick API cookbook

```bash
# Health
curl http://localhost:4000/api/health

# Signup
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"321000","name":"Test User"}' \
  | jq -r .token)

# Create subscription
curl -X POST http://localhost:4000/api/subscription \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"planId":"squad","billingCycleId":"monthly-no-sun"}'

# Skip a meal
curl -X POST http://localhost:4000/api/subscription/skip-meal \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"date":"2026-06-01","slot":"lunch"}'

# Admin view
ADMIN=$(curl -s -X POST http://localhost:4000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"9360113501","otp":"350100"}' | jq -r .token)
curl -H "Authorization: Bearer $ADMIN" \
  http://localhost:4000/api/admin/skip-notifications
```

---

## 13. References

- **DESIGN.md** — design system, palette, component philosophy
- **README.md** — short entry point
- **server/src/routes/** — every endpoint's source of truth
- **src/lib/skip.ts** + **server/src/lib/skip.ts** — keep these two files in sync for the cutoff/limit rules

— end —
