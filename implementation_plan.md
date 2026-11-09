# Implementation Plan: Dhuri Tutors

> Build order for Claude Code. Do phases in order; finish a phase's "Done when" checks before starting the next.
> Task IDs here match `tracker.md`. Phases 0–6 = V0 (launch). Phases 7–8 = parent requests and teacher sign-up (new scope, owner go-ahead 2026-11-09 — see `tracker.md` Decisions log; wait for an explicit "start building" before beginning). Phases 9–10 = V1 (photos; teacher stats and reminders). Phase 11 = V2 (only after the owner decides).

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
| P0.9 | Update `lib/config.ts` AREAS to the final Dhuri town + nearby villages list (two `<optgroup>` groups: "Dhuri", "Nearby villages"), plus the "Other village (type name)" free-text pattern; update `schema.md`, `supabase/seed.sql` and every doc example to match. Added 2026-11-09, out of original Phase 0 order — do this **first**, before any Phase 7/8 work, since the area dropdown is used everywhere |

**Done when:** `npm run typecheck` and `npm run build` pass; `npm run dev` shows the placeholder page. (P0.9 re-done when Phase 7 starts.)

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

## Phase 7: Parent request form

**Goal:** a parent who can't find a match through search can leave their details for the admin to work, with no account, in under 3 minutes. Added 2026-11-09 (owner go-ahead); wait for an explicit "start building" before beginning. Start only after P0.9.

| ID | Task |
|---|---|
| P7.1 | Migration `0002_requests_teacher_signup.sql` per `schema.md` §3: `teaching_entries`, `requests`, `edit_tokens` tables; new `listings` columns (`serves_areas`, `area_other`, `experience_years`, `qualification_level`, `qualification`, `languages`, `headline`, `source`) + GIN index on `serves_areas` |
| P7.2 | Shared multi-step form shell: step bar component, `?step=N` routing, `localStorage` draft (try/catch), "Your progress is saved on this phone" note, "What happens next" box (bordered on mobile, right column ≥1024px) per `design.md` §11 — used by both `/request` and `/join` |
| P7.3 | `lib/validation.ts`: request form validation (what / where and when / your details steps) |
| P7.4 | `/request` step 1 "What": class, subjects (search-as-you-type + "All subjects for this class"), board, mode; live "N teachers match" line linking to search |
| P7.5 | `/request` step 2 "Where and when": area dropdown (optgroups + "Other village"), timings, budget min/max |
| P7.6 | `/request` step 3 "Your details": adult/minor branching, notes (≤300 chars), consent checkbox |
| P7.7 | `/request` step 4 "Send": summary with per-section Edit links; `createRequestAction` (ref `R`-code); WhatsApp button to `ADMIN_WHATSAPP`; "We'll reply on WhatsApp within 24 hours" |
| P7.8 | Home page: "Can't find the right teacher? Tell us what you need" link on the no-results message; header "Join as a teacher" link (secondary button) on all public pages |
| P7.9 | `/admin/requests`: list by status, newest first; matching published teachers per request (`area` or `serves_areas`); "Send to teacher" WhatsApp button (parent number only if "Parent agreed to share" ticked); new-request count on dashboard; "No teacher found" report grouped by subject/class/village |

**Done when:** a parent can submit a request end to end on a phone and it appears correctly in `/admin/requests` with matches.

---

## Phase 8: Teacher sign-up form

**Goal:** a teacher or academy can list themselves from their own phone, with no account, in under 10 minutes. Added 2026-11-09 (owner go-ahead); wait for an explicit "start building" before beginning. Replaces the old Phase 7 self-submit/approval-queue design (P7.2–P7.5 in the previous plan) but keeps the private edit link.

| ID | Task |
|---|---|
| P8.1 | `/join` step 1 "About you": teacher/academy option boxes, name, academy name, mobile, WhatsApp, area dropdown, address/landmark note |
| P8.2 | Shared teaching-list component: tabs (School / Entrance and competitive exams / Skills and activities), "Add to teaching list" box per tab, "Your teaching list" with Remove, keeps each tab's unfinished selection when switching — used by `/join` and the admin listing form |
| P8.3 | `/join` step 2 "Teaching": the P8.2 component; boards chosen once; mode option boxes; "Villages I can travel to" (multi-select AREAS) when Home tuition is ticked |
| P8.4 | `/join` step 3 "Profile": years teaching, qualification dropdown + details, languages, fee min/max + note, timings, headline (≤80 chars, optional), about (≤600 chars) |
| P8.5 | `/join` step 4 "Review": real public listing preview, Edit link per step, consent checkbox |
| P8.6 | `/join` step 5 "Send": `createSignupAction` (saves unpublished, `source='self'`); WhatsApp button with ref `J`-code; "We'll check your details and publish your page within 2 days" |
| P8.7 | Private edit link: `edit_tokens` issued on admin Approve; `/edit/[token]` page for the teacher to update their own listing (no approval step for routine edits — simpler than the original V1 approval-queue design) |
| P8.8 | Admin: "New sign-ups" section on the dashboard (Approve → publish + issue edit link; Reject); admin listing form (`ListingForm.tsx`) updated to use the P8.2 teaching-list component and the `serves_areas` field |

**Done when:** a teacher can sign up end to end on a phone, and the admin can approve or reject from the dashboard; an approved teacher's private edit link works.

---

## Phase 9: V1 — photos

Renumbered from the previous plan's Phase 7 (P7.6). Start only after V0 has run for a few weeks and the owner confirms.

| ID | Task |
|---|---|
| P9.1 | Photos on listings (Supabase Storage, max 3, compressed, admin-approved) |

---

## Phase 10: V1 — teacher stats and reminders

Renumbered from the previous plan's Phase 8.

| ID | Task |
|---|---|
| P10.1 | Admin "copy monthly stats message" per listing (views, WhatsApp taps, calls, last 30 days) |
| P10.2 | Page-view counting per listing (same de-duplication approach as taps) |
| P10.3 | Re-confirm reminder list: listings due for re-confirmation with a prefilled WhatsApp message |

---

## Phase 11: V2 — paid options (only on owner's decision)

Renumbered from the previous plan's Phase 9.

Featured listings, admission-season boost, sponsor slots (labelled "Sponsored", max 3). Spec to be written when traffic and tap data justify it.
