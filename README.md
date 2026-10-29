# Dhuri Tutors

A directory of tuition teachers and academies in Dhuri. Parents search by subject, class and area, then contact a teacher directly on WhatsApp or by phone. See `project_requirement_document.md` for the full brief and `design.md` for the look.

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values, see §3 below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page needs a working Supabase project (§2) to show any listings.

Useful scripts:

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (must pass before any task is marked done) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests (`lib/format.ts`, `lib/validation.ts`) |
| `npm run lint` | ESLint |

## 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough).
2. In the Supabase dashboard → **SQL Editor**, run every file in `supabase/migrations/` **in order** (currently just `0001_init.sql`). This creates the `listings` and `taps` tables, their indexes and checks, and turns on Row Level Security with no policies (the app only ever talks to Supabase with the service-role key, which bypasses RLS; nothing public can read or write directly).
3. **Dev only** — also run `supabase/seed.sql` to get a handful of fake sample listings to develop against. **Never run this against a production project**: rules.md requires V0 to launch with real teachers only, no demo data.
4. In the dashboard → **Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (under "Project API keys", not the `anon` key) → `SUPABASE_SERVICE_ROLE_KEY`

   The service-role key can read and write every row, bypassing Row Level Security — it must only ever be used on the server, and must never be exposed to the browser or committed to git.

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | What it's for |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL (§2) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key for server-side database access (§2). Never commit, never prefix with `NEXT_PUBLIC_` |
| `ADMIN_PASSWORD` | The one password that logs into `/admin`. Pick something you don't use anywhere else |
| `TAP_SALT` | A random string (e.g. `openssl rand -hex 16`) used to hash visitor IPs so taps can be de-duplicated without ever storing a raw IP address |
| `NEXT_PUBLIC_APP_NAME` | Shown in the header and page titles. Not final — see `tracker.md` Decisions log |
| `NEXT_PUBLIC_CITY` | The city listings are filtered to (`Dhuri`) |
| `NEXT_PUBLIC_SITE_URL` | Used in QR codes, the WhatsApp share link and Open Graph tags. `http://localhost:3000` locally; the real domain in production |

`.env.local` is in `.gitignore` and must never be committed. `.env.example` has no real values and is safe to commit.

## 4. Deploy

1. Create a **second, production** Supabase project (don't reuse the dev one) and run `0001_init.sql` only — no seed data (owner step, `tracker.md` P6.5).
2. Push this repo to GitHub.
3. In [vercel.com](https://vercel.com), **Add New Project** → import the GitHub repo. Vercel auto-detects Next.js; no build settings to change.
4. In the Vercel project → **Settings → Environment Variables**, add every variable from §3 using the **production** Supabase project's keys, and set `NEXT_PUBLIC_SITE_URL` to the real domain.
5. Deploy. `main` branch is production; any other branch gets its own preview URL (point preview deployments at the dev Supabase project if you set up a second env scope for them).
6. Vercel Web Analytics is already wired into the app (`app/layout.tsx`) — turn it on for the project under the Vercel dashboard's **Analytics** tab; no code change needed.

## 5. How to onboard a teacher

This is the admin's day-to-day job once the site is live (see `app_flow.md` Flow 3 for the full picture):

1. Visit or call the teacher in person. **Only continue if they agree to be listed** — a listing can never be published without this.
2. Log in at `/admin/new` and fill in the form on your phone: type, name, contact, phone, subjects, classes, area, fees, timings, etc. Tick **"The teacher agreed to be listed on this site"** — this records the date and is required before you can publish.
3. Press **Save and publish**. This generates the listing's slug (its URL, e.g. `/t/sharma-maths-classes`) and a short ref code (e.g. `D7`) that appears in the WhatsApp message parents send, so you can match enquiries back to a listing.
4. On the edit page (`/admin/[id]`), copy the public link and download the QR code.
5. Send both to the teacher on WhatsApp, and tell them: enquiries will mention the ref code so they know it came from this site.
6. Every so often (`app_flow.md` Flow 4): the dashboard flags listings not confirmed in 60+ days in amber. Ask the teacher if anything's changed, update if needed, then press **Mark verified today**. If they've stopped teaching, **Unpublish** — the link then shows "Not found" instead of deleting their data.

## 6. Project docs

Read in this order when picking up work — see `rules.md` for the full process:

- `rules.md` — how Claude Code should work in this repo
- `tracker.md` — task list, current status, decisions log
- `implementation_plan.md` — phases and tasks
- `project_requirement_document.md`, `tech_spec.md`, `app_flow.md`, `schema.md`, `design.md` — what to build, how, the screens, the data, and the look
