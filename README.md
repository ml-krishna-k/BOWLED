# Bowled

Daily meal subscription for students in PGs, hostels and rented rooms across Chennai.

> A venture by **Sree Krishna Catering** — feeding Chennai since 2006. Bowled launched May 2025 and now serves 300+ students daily.

**Stack** · React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · React Router 7 · Express 5 · Mongoose 8 · MongoDB Atlas · MSG91 (OTP) · Cloudinary (images) · JWT auth

---

## Quick start (local, no Docker)

```powershell
# 1. Install deps
npm install --strict-ssl=false
npm --prefix server install --strict-ssl=false

# 2. Configure env
copy .env.example .env
# → fill in mongo_db_uri, JWT_SECRET, CLOUDINARY_* (and MSG91_* if you want real SMS)

# 3. Seed kitchens + demo subscribers + admin user (one-time)
npm run seed

# 4. Run frontend (5173) + API (4000)
npm run dev:all
```

Open <http://localhost:5173>. Sign in with any 10-digit Indian mobile; without MSG91 the OTP is `<last-4-of-phone>00`.
Admin demo: phone `9360113501`, OTP `350100`.

---

## Quick start (Docker)

```powershell
copy .env.example .env
# fill in the same env values

docker compose up --build
```

- Web → <http://localhost:8080>
- API → <http://localhost:4000>

The compose stack does NOT include Mongo — point `mongo_db_uri` at your Atlas cluster.

---

## Documentation

- **[PROJECT.md](./PROJECT.md)** — architecture, API reference, data model, env vars, run scripts, known quirks, roadmap.
- **[DESIGN.md](./DESIGN.md)** — design system, palette, component philosophy.

## Path aliases

`@/` → `src/`

```ts
import { Button } from '@/components/ui/Button'
```

---

## Deployment notes

- **Frontend** builds to static files (`npm run build`) — drop on Vercel, Netlify, Cloudflare Pages, or the included nginx Dockerfile.
- **API** is a stateless Node/Express service — Render, Railway, Fly.io, or the included Node Dockerfile.
- **Mongo** lives on Atlas; whitelist your hosting platform's egress IPs.
- **Production refuses to start** without `JWT_SECRET` (non-default) and `MSG91_API_KEY` + `MSG91_TEMPLATE_ID`. Cloudinary keys are optional but image uploads will 503 without them.
- See [PROJECT.md § Environment](./PROJECT.md) for the full env-var reference.

## Security

- `.env` and `*.pem` are git-ignored — never commit secrets.
- JWTs live in `localStorage` and expire after 30 days.
- Per-IP and per-phone rate limits on all OTP routes.
- All write routes go through `zod` validation; admin routes require `requireAuth` + `requireAdmin`.
