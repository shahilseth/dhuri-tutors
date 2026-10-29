# Implementation Plan: Dhuri Tutors

> Build order for Claude Code. Do phases in order; finish a phase's "Done when" checks before starting the next.
> Task IDs here match `tracker.md`. Phases 0–6 = V0 (launch). Phases 7–8 = V1. Phase 9 = V2 (only after the owner decides).

---

## Phase 0: Project setup

**Goal:** an empty app that builds and deploys.

| ID | Task |
|---|---|
| P0.1 | Create Next.js 15 app (App Router, TypeScript, no `src/` dir, `@/*` alias) with npm |
| P0.2 | Install Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`); add theme tokens from `design.md` to `app/globals.css` under `@theme` |
| P0.3 | Install `@supabase/supabase-js`, `server-only`, `qrcode`, `@types/qrcode`; dev: `vitest` |
| P0.4 | Add scripts: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`) |
| P0.5 | Create `.env.example` with all variables from `tech_spec.md` §6; add `.env*.local` to `.gitignore` |
| P0.6 | Create `lib/config.ts` (app name, city, site URL, SUBJECTS, CLASSES, BOARDS, MODES, AREAS, STALE_AFTER_DAYS) and `lib/types.ts` |
| P0.7 | Basic `app/layout.tsx` (header with app name + city, footer) and placeholder home page |
| P0.8 | `git init`, first commit |

**Done when:** `npm run typecheck` and `npm run build` pass; `npm run dev` shows the placeholder page.

---

## Phase 1: Database and data layer

**Goal:** schema in Supabase and one server-only module for all data access.

| ID | Task |
|---|---|
| P1.1 | Write `supabase/migrations/0001_init.sql` exactly per `schema.md` §2 (tables, checks, indexes, trigger, RLS, view) |
| P1.2 | Write `supabase/seed.sql` with 6 clearly fake listings across different subjects, classes, areas and modes (dev only) |
| P1.3 | **Owner step:** create Supabase dev project, run 0001 + seed, put keys in `.env.local` |
| P1.4 | `lib/data.ts` (imports `server-only`): `searchListings`, `getListingBySlug`, `listAllListings`, `getListingById`, `slugTaken`, `nextRefCode`, `createListing`, `updateListing`, `logTap`, `getTapCounts` |
| P1.5 | `lib/format.ts`: `feeText`, `classesText`, `modeLabel`, `ago`, `isStale`, `intl` (phone → `91XXXXXXXXXX`), `whatsappMessage`, `whatsappUrl`, `telUrl`, `slugify` |
| P1.6 | Vitest tests for every function in `lib/format.ts` |

**Done when:** tests pass; a temporary server component can list seed data from Supabase (remove it afterwards).

---

## Phase 2: Public search and listing pages

**Goal:** parents can search and view listings.

| ID | Task |
|---|---|
| P2.1 | `components/ListingCard.tsx` per `app_flow.md` S1 card |
| P2.2 | `app/page.tsx`: GET filter form (Subject, Class, Area, Mode, name), validate params against config lists, call `searchListings`, render count + cards + empty state |
| P2.3 | `app/t/[slug]/page.tsx`: full listing page per `app_flow.md` S2 (contact buttons as plain links for now) |
| P2.4 | `generateMetadata` on the listing page: title, description, Open Graph |
| P2.5 | `app/not-found.tsx` |
| P2.6 | `app/manifest.ts` + `public/icon.svg`; `app/robots.ts` disallowing `/admin` and `/api` |

**Done when:** every filter combination returns correct results from the seed data; listing pages render all fields; unknown slug shows Not found; works at 320 px width.

---

## Phase 3: Contact buttons and tap counting

**Goal:** every WhatsApp/Call tap is counted without ever blocking contact.

| ID | Task |
|---|---|
| P3.1 | `app/api/tap/route.ts` per `tech_spec.md` §3.1 (validation, bot filter, visitor hash, insert) |
| P3.2 | `components/ContactButtons.tsx` (client): `<a href>` to `wa.me` / `tel:`, `onClick` sends beacon (`text/plain` body), `fetch keepalive` fallback, errors swallowed |
| P3.3 | Use `ContactButtons` on the listing page; WhatsApp message includes the ref code |
| P3.4 | "Share on WhatsApp" button on the listing page |

**Done when:** tapping each button inserts a row in `taps`; repeated taps the same day show as 1 in `listing_tap_counts`; buttons still work with JS disabled and with `/api/tap` returning 500.

---

## Phase 4: Admin

**Goal:** the owner can onboard and maintain teachers from a phone.

| ID | Task |
|---|---|
| P4.1 | `lib/auth.ts`: `isAdmin`, `requireAdmin`, `logIn` (500 ms delay on failure), `logOut`, HMAC cookie per `tech_spec.md` §4 |
| P4.2 | `/admin/login` page + `loginAction`; logout action |
| P4.3 | `lib/validation.ts` per `tech_spec.md` §8 + Vitest tests (phone formats, fee min/max, empty arrays, invalid list values) |
| P4.4 | `components/ListingForm.tsx` (client, `useActionState`): all fields in `app_flow.md` order, keeps values and shows field errors on failure, "Saving…" state |
| P4.5 | `/admin/new` + `createListingAction` (unique slug with `-2` suffixes, `nextRefCode`, `consent_at`) |
| P4.6 | `/admin/[id]` + `updateListingAction`; read-only ref code; public link with copy button |
| P4.7 | `/admin` dashboard per `app_flow.md` A2 with tap counts and stale flags |
| P4.8 | `markVerifiedAction`, `togglePublishedAction` (refuse publish without consent/required fields) |
| P4.9 | Every admin page and action calls `requireAdmin()` first |

**Done when:** a new teacher can be added, published, edited, verified and unpublished from a phone; publishing without consent is refused; logged-out requests to admin pages and actions are rejected.

---

## Phase 5: QR codes

| ID | Task |
|---|---|
| P5.1 | `app/api/qr/[slug]/route.ts`: admin-only PNG (≥ 600 px, margin 2) of `${SITE_URL}/t/${slug}`, downloaded as `<slug>-qr.png` |
| P5.2 | QR preview + Download button on `/admin/[id]`; Download QR link on dashboard rows |

**Done when:** a printed QR scanned with a phone camera opens the right listing.

---

## Phase 6: Hardening, QA and launch (end of V0)

| ID | Task |
|---|---|
| P6.1 | Accessibility pass: labels, 44 px tap targets, contrast, focus states |
| P6.2 | Performance pass: check JS size, Lighthouse mobile ≥ 90 on home and listing pages |
| P6.3 | Add Vercel Web Analytics |
| P6.4 | `README.md`: local setup, Supabase setup, env vars, deploy steps, how to onboard a teacher |
| P6.5 | **Owner step:** create Supabase prod project, run `0001_init.sql` only (no seed) |
| P6.6 | **Owner step:** GitHub repo → Vercel project → env vars → deploy |
| P6.7 | **Owner step:** enter the 5–10 real teachers with consent; send each their link + QR |
| P6.8 | Manual test checklist (below) on a real Android phone and an iPhone if available |

**Launch checklist**
- [ ] Search with each filter alone and combined
- [ ] Listing link shared in WhatsApp shows a preview
- [ ] WhatsApp button opens chat with ref code; Call opens dialler
- [ ] Tap appears in admin counts; second tap same day doesn't increase it
- [ ] Unpublished listing link shows Not found
- [ ] Admin login, wrong password rejected; admin pages blocked when logged out
- [ ] QR prints and scans
- [ ] Add to home screen works

**Done when:** checklist passes on production. **V0 is live.**

---

## Phase 7: V1 — teacher self-submit and edit links

Start only after V0 has run for a few weeks and the owner confirms.

| ID | Task |
|---|---|
| P7.1 | Migration `0002`: `edit_tokens`, `pending_changes` per `schema.md` §3 |
| P7.2 | `/join` short public form → creates `pending_changes` (`new_listing`), rate-limited, consent required |
| P7.3 | `/admin/approvals` queue: approve (creates listing, unpublished until admin publishes) / reject |
| P7.4 | Edit token issue/revoke in admin; message template with private link |
| P7.5 | `/edit/[token]`: teacher edits own listing; name/phone changes go to `pending_changes` (`identity_change`) |
| P7.6 | Photos on listings (Supabase Storage, max 3, compressed, admin-approved) |

---

## Phase 8: V1 — teacher stats and reminders

| ID | Task |
|---|---|
| P8.1 | Admin "copy monthly stats message" per listing (views, WhatsApp taps, calls, last 30 days) |
| P8.2 | Page-view counting per listing (same de-duplication approach as taps) |
| P8.3 | Re-confirm reminder list: listings due for re-confirmation with a prefilled WhatsApp message |

---

## Phase 9: V2 — paid options (only on owner's decision)

Featured listings, admission-season boost, sponsor slots (labelled "Sponsored", max 3). Spec to be written when traffic and tap data justify it.
