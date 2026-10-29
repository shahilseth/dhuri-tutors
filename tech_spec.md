# Technical Specification: Dhuri Tutors

> Read with `project_requirement_document.md` (what to build), `schema.md` (data) and `app_flow.md` (screens).
> Visual design comes from `design.md`.

## 1. Stack (decided, do not swap without updating this file)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router), TypeScript, React 19** | Server rendering keeps pages fast on cheap phones; server actions and route handlers remove the need for a separate backend |
| Styling | **Tailwind CSS v4** | Small CSS output, quick to build mobile-first layouts; tokens defined in `@theme` from `design.md` |
| Database | **Supabase (PostgreSQL), free tier** | Managed Postgres with a table editor the admin can use in an emergency; array columns and GIN indexes suit tag-style filters |
| DB client | **`@supabase/supabase-js` v2, server-side only, service-role key** | All reads and writes happen on the server; the browser never talks to the database |
| Hosting | **Vercel, Hobby (free) tier** | Native Next.js hosting, preview deployments per branch, HTTPS by default |
| QR codes | **`qrcode`** npm package | Generates PNG/SVG on the server |
| Analytics (visits) | **Vercel Web Analytics** (free tier) | Page views without cookies; contact taps are tracked separately in our own table |
| Package manager | **npm** | Default; one lockfile |
| Node | **22 LTS** | Matches Vercel default |

Not used in V0: Supabase Auth, Supabase Storage, any CSS framework beyond Tailwind, any state-management library, any ORM.

## 2. Architecture

```
Browser (phone)
   │  HTML pages (server-rendered)          sendBeacon POST /api/tap
   ▼                                              │
Next.js on Vercel ────────────────────────────────┘
   ├─ Server Components  → read listings
   ├─ Server Actions     → admin create / edit / verify / publish / login
   ├─ Route Handlers     → /api/tap, /api/qr/[slug]
   └─ lib/data.ts (server-only) ──► Supabase Postgres (service-role key, RLS on, no policies)
```

- Every database call goes through `lib/data.ts`, which imports `server-only`. No component or client file talks to Supabase directly.
- Public pages are dynamic (`force-dynamic`) in V0 so edits show immediately. Caching can be added later if traffic grows.

## 3. APIs

### 3.1 Internal endpoints (route handlers)

| Method & path | Auth | Purpose | Request | Response |
|---|---|---|---|---|
| `POST /api/tap` | none | Record a Call or WhatsApp tap | body (text/plain JSON): `{ "slug": string, "channel": "whatsapp" \| "call" }` | `204` recorded or ignored (bot); `400` bad body; `404` unknown or unpublished slug |
| `GET /api/qr/[slug]` | admin cookie | PNG QR code of `${SITE_URL}/t/${slug}` | — | `image/png`, `Content-Disposition: attachment; filename="<slug>-qr.png"`; `401` if not admin; `404` unknown slug |

`/api/tap` rules:
- Called from the client with `navigator.sendBeacon` (fallback: `fetch` with `keepalive`). The button's own `href` (`wa.me` / `tel:`) does the navigation, so logging failures never block contact.
- Ignore user agents matching bots and link-preview crawlers (`bot|crawl|spider|preview|facebookexternalhit|whatsapp|curl|wget|python|headless`).
- Store `visitor` = first 24 hex chars of `sha256(TAP_SALT | ip | user-agent)`. Never store the raw IP.

### 3.2 Server actions (admin only, all check the admin cookie first)

| Action | Does |
|---|---|
| `loginAction(formData)` | Checks password, sets session cookie, redirects to `/admin` |
| `logoutAction()` | Deletes cookie |
| `createListingAction(prevState, formData)` | Validates, generates slug and ref code, inserts |
| `updateListingAction(id, prevState, formData)` | Validates, updates |
| `markVerifiedAction(id)` | Sets `last_verified_at = now()` |
| `togglePublishedAction(id)` | Publishes (only if valid and consent recorded) or unpublishes |

Server actions return `{ error: string \| null, fieldErrors?: Record<string,string> }` for forms and use `revalidatePath` / `redirect` on success.

### 3.3 External links (no API keys needed)

| Purpose | Format |
|---|---|
| WhatsApp chat | `https://wa.me/91XXXXXXXXXX?text=<url-encoded message with ref code>` |
| Phone call | `tel:+91XXXXXXXXXX` |
| Share listing | `https://wa.me/?text=<name + link>` |

No third-party APIs (payments, SMS, maps) in V0.

## 4. Authentication and authorization

| Who | How | Can do |
|---|---|---|
| Public visitor | No auth | Read published listings; POST taps |
| Admin | Single password in env `ADMIN_PASSWORD`. On login, set cookie `admin_session` = HMAC-SHA256(key = password, message = `"dhuri-admin-session-v1"`), `httpOnly`, `secure` in production, `sameSite=lax`, 30-day expiry | Everything under `/admin` and `/api/qr` |
| Teacher (V1) | Private edit link `/edit/<token>`; token = 32 random bytes, base64url; only its SHA-256 hash is stored | Edit own listing; name/phone changes go to approval |

Rules:
- Every admin page calls `requireAdmin()` at the top; every admin server action calls it before doing anything. Middleware alone is not enough.
- Compare secrets with `timingSafeEqual`.
- Changing `ADMIN_PASSWORD` logs everyone out (cookie no longer matches).
- Login attempts: add a fixed 500 ms delay on failure (cheap brute-force slowdown).
- Supabase: RLS enabled on every table with no policies, so the anon key (unused) can read nothing. Only the service-role key, held server-side, can access data.

## 5. Database

Supabase PostgreSQL. Full design in `schema.md`. Summary:
- `listings`: one row per teacher or academy.
- `taps`: one row per contact tap.
- `listing_tap_counts`: view with de-duplicated counts (30 days and all time).
- V1 adds `edit_tokens` and `pending_changes`.

Migrations live in `supabase/migrations/NNNN_description.sql`, applied in order through the Supabase SQL editor (or Supabase CLI if installed). Never edit an applied migration; add a new one.

Two Supabase projects: **dev** (seeded with fake sample data) and **prod** (real listings only).

## 6. Environment variables

| Name | Where | Example | Notes |
|---|---|---|---|
| `SUPABASE_URL` | server | `https://xxxx.supabase.co` | |
| `SUPABASE_SERVICE_ROLE_KEY` | server | `eyJ...` | Secret. Never prefixed `NEXT_PUBLIC_` |
| `ADMIN_PASSWORD` | server | 16+ random chars | Secret |
| `TAP_SALT` | server | 32 random chars | Secret; changing it resets de-duplication |
| `NEXT_PUBLIC_APP_NAME` | public | `Dhuri Tutors` | |
| `NEXT_PUBLIC_CITY` | public | `Dhuri` | Filters listings by `city` |
| `NEXT_PUBLIC_SITE_URL` | public | `https://dhuritutors.in` | Used in QR codes, share links, OG tags |

Provide `.env.example` with every variable and no real values.

## 7. Project structure

```
app/
  layout.tsx, globals.css, page.tsx (home + search), not-found.tsx, manifest.ts
  t/[slug]/page.tsx                  listing page
  api/tap/route.ts                   tap logging
  api/qr/[slug]/route.ts             QR PNG (admin)
  admin/login/page.tsx
  admin/page.tsx                     dashboard
  admin/new/page.tsx
  admin/[id]/page.tsx                edit
  admin/actions.ts                   server actions
components/
  ListingCard.tsx, ContactButtons.tsx (client), ListingForm.tsx (client), ...
lib/
  config.ts      app name, city, subject/class/board/mode/area lists, stale days
  types.ts       Listing, SearchFilters, TapCounts, ...
  data.ts        all DB access (server-only)
  auth.ts        admin session (server-only)
  format.ts      fee text, class text, wa/tel URLs, slugify, "x days ago"
  validation.ts  listing form validation
supabase/
  migrations/0001_init.sql
  seed.sql       fake sample data for the dev project only
public/
  icon.svg
```

## 8. Validation rules (listing form)

| Field | Rule |
|---|---|
| name | required, 2–80 chars |
| kind | `teacher` or `academy` |
| phone | strip non-digits; drop leading `91`/`0`; must be 10 digits starting 6–9 |
| whatsapp | optional, same rule; empty means same as phone |
| subjects, classes, modes | at least one each, values only from `lib/config.ts` lists |
| boards | optional, from list |
| area | required, from list |
| fee_min, fee_max | optional integers 0–100000; if both set, min ≤ max |
| slug | lowercase a–z, 0–9, hyphens; 3–60 chars; unique; auto from name, suffix `-2`, `-3` on clash |
| ref_code | auto: city initial + next number (`D1`, `D2`, …); never reused, never edited |
| consent | checkbox; required to publish; `consent_at` set the first time it's ticked and kept after |
| text fields | trimmed; about ≤ 600 chars, timings ≤ 120, fee_note ≤ 80, address ≤ 120 |

The same validation runs on the server for every write; client-side checks are only for convenience.

## 9. Non-functional requirements

- **Performance:** home and listing pages under 100 KB JS transferred; Lighthouse mobile performance ≥ 90; no web fonts (system font stack); no images in V0.
- **Accessibility:** tap targets ≥ 44 px, labels on all inputs, colour contrast AA, works at 320 px width.
- **No-JS fallback:** search and contact links work with JavaScript off (taps just aren't counted).
- **SEO / sharing:** Open Graph title and description per listing; `robots` allows public pages, disallows `/admin` and `/api`.
- **Privacy:** no cookies for public visitors; no raw IPs stored; consent stored per listing.
- **Cost:** must stay inside Vercel Hobby and Supabase free tier.

## 10. Testing

- `npm run typecheck` and `npm run build` must pass before any task is marked done.
- Unit tests with **Vitest** for `lib/format.ts` and `lib/validation.ts` (phone normalisation, fee text, slugify, ref code generation).
- Manual test checklist per phase (in `implementation_plan.md`), run on a real Android phone before launch.

## 11. Deployment

1. Create Supabase prod project → run migrations in order.
2. Push repo to GitHub → import into Vercel → set env vars → deploy.
3. Point domain (optional) and set `NEXT_PUBLIC_SITE_URL` to it.
4. `main` branch = production; other branches get preview deployments using the dev Supabase project.
