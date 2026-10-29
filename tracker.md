# Tracker: Dhuri Tutors

> **Maintained by Claude Code.** Read this file at the start of every session and update it at the end of every task.
> Task IDs match `implementation_plan.md`. Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked · `[-]` skipped (say why).
> Only one task may be `[~]` at a time. Mark `[x]` only after `npm run typecheck` and `npm run build` pass (and tests, where the task has them).

## Current status

- **Current phase:** Phase 2 — public search and listing pages
- **Current task:** P2.6
- **Last updated:** 2026-10-29
- **Blocked on owner:** —

## Phase 0: Project setup
- [x] P0.1 Create Next.js 15 app
- [x] P0.2 Tailwind v4 + theme tokens from design.md
- [x] P0.3 Install dependencies
- [x] P0.4 npm scripts
- [x] P0.5 .env.example + .gitignore
- [x] P0.6 lib/config.ts + lib/types.ts
- [x] P0.7 Layout + placeholder home
- [x] P0.8 git init + first commit

## Phase 1: Database and data layer
- [x] P1.1 Migration 0001_init.sql
- [x] P1.2 seed.sql (fake data, dev only)
- [x] P1.3 OWNER: Supabase dev project + keys in .env.local
- [x] P1.4 lib/data.ts
- [x] P1.5 lib/format.ts
- [x] P1.6 Tests for lib/format.ts

## Phase 2: Public search and listing pages
- [x] P2.1 ListingCard
- [x] P2.2 Home + search
- [x] P2.3 Listing page
- [x] P2.4 Metadata / Open Graph
- [x] P2.5 Not found page
- [x] P2.6 Manifest, icon, robots

## Phase 3: Contact buttons and tap counting
- [ ] P3.1 /api/tap
- [ ] P3.2 ContactButtons
- [ ] P3.3 Wire into listing page with ref code message
- [ ] P3.4 Share on WhatsApp button

## Phase 4: Admin
- [ ] P4.1 lib/auth.ts
- [ ] P4.2 Login / logout
- [ ] P4.3 lib/validation.ts + tests
- [ ] P4.4 ListingForm
- [ ] P4.5 New listing
- [ ] P4.6 Edit listing
- [ ] P4.7 Dashboard
- [ ] P4.8 Verify + publish actions
- [ ] P4.9 requireAdmin audit

## Phase 5: QR codes
- [ ] P5.1 /api/qr/[slug]
- [ ] P5.2 QR in admin

## Phase 6: Hardening, QA and launch
- [ ] P6.1 Accessibility pass
- [ ] P6.2 Performance pass
- [ ] P6.3 Vercel Analytics
- [ ] P6.4 README
- [ ] P6.5 OWNER: Supabase prod project
- [ ] P6.6 OWNER: GitHub + Vercel deploy
- [ ] P6.7 OWNER: enter 5–10 real teachers
- [ ] P6.8 Launch checklist on real phones

## Phase 7–9
Not started. Do not begin without the owner's go-ahead.

---

## Decisions log
Record any decision that changes or adds to the spec docs. Newest first.

| Date | Decision | Why | Docs updated |
|---|---|---|---|
| 2026-10-28 | V0 launches with 5–10 real teachers entered by admin; no demo listings in production | Real listings test demand; demo data tests nothing | PRD, plan |
| 2026-10-28 | Count taps now; monetisation decided later | Need data before pricing | PRD |
| 2026-10-28 | Ref code in WhatsApp message from day one | Lets taps be checked against real enquiries | PRD, tech spec |
| 2026-10-29 | App name for V0: "Dhuri Tutors" (not final) | Owner hasn't picked a final name/domain yet; `NEXT_PUBLIC_APP_NAME` keeps it a one-place change | PRD |
| 2026-10-29 | Area list seeded with 4 real localities (Pathshalla Mohalla, Janta Nagar, Shivpuri, Bank Road); more to come from owner | Full list not ready yet; config list is additive so more can be added anytime | — |
| 2026-10-29 | `design.md` replaced: old file was a generic AAA marketing template (hero, zig-zag, spring animations) that didn't fit this app's real screens or `tech_spec.md`'s AA/no-images/low-JS rules. New version targets AA, no images, minimal motion, components mapped to actual screens | PRD, tech spec (AA, not AAA) |
| 2026-10-29 | `design.md` rewritten again by the owner directly: "blue ink on a clean register" concept, full token/component/writing spec with checked contrast numbers | — |
| 2026-10-29 | Final CLASSES and SUBJECTS lists set, each with a stable `value` (never renamed) and a display `label`, grouped with `<optgroup>`. Classes: School (nursery–12), Entrance/competitive exams (jee, neet, nda, jnv-sainik, ssc, banking, punjab-govt, army, ielts-pte), College (bcom, ba, bsc, bca, other-college). Subjects: School subjects (incl. "all"), Skills/extra classes, Exam preparation | schema.md (class value examples updated), lib/config.ts |

## Blockers and questions for the owner
Add items here instead of guessing. Remove when answered.

- [ ] Full list of Dhuri localities for the area filter (have 4 so far: Pathshalla Mohalla, Janta Nagar, Shivpuri, Bank Road — more to follow)
- [ ] Owner's own WhatsApp number for the public footer's "Message us on WhatsApp" link (teachers asking to get listed). Not in `tech_spec.md` §6 env vars yet — footer currently shows this as plain text, not a link, until there's a number and an env var for it

## Session log
One entry per session, newest first. Keep each entry to 2–4 lines.

### 2026-10-29 (session 2)
- Done: P1.1 migration `0001_init.sql` (listings, taps, indexes, checks, trigger, RLS, `listing_tap_counts` view — per schema.md §2); P1.2 `seed.sql` (6 fake listings spread across subjects/classes/areas/modes, one left unpublished with no consent to exercise that path); P1.4 `lib/data.ts` (searchListings, getListingBySlug, listAllListings, getListingById, slugTaken, nextRefCode, createListing, updateListing, logTap, getTapCounts); P1.5 `lib/format.ts` (feeText, classesText, modeLabel, ago, isStale, intl, whatsappMessage, whatsappUrl, telUrl, slugify); P1.6 Vitest tests for every `lib/format.ts` function (22 tests, all passing).
- Notes: owner's "continue from the next open task" was treated as the go-ahead for Phase 1 (rules.md §1: a chat instruction overrides a waiting tracker note). P1.3 is an OWNER step (create Supabase dev project, run migration + seed, add keys to `.env.local`) so it's marked `[!]` and skipped; P1.4–P1.6 don't need a live database to write or type-check, but the Phase 1 "done when" (a temporary server component listing real seed data) can't be confirmed until P1.3 is done. `npm run typecheck`, `build`, `lint` and `test` all pass after every task.
- Next: owner to do P1.3, then a quick live check that `lib/data.ts` reads the seeded rows before Phase 1 is fully closed out and Phase 2 starts.

### 2026-10-29 (session 3)
- Done: owner completed P1.3 (Supabase dev project, migration + seed run, keys in `.env.local`). Verified live: temporarily wired `app/page.tsx` to call `listAllListings()`, ran `npm run dev`, confirmed all 6 seeded listings (D1–D6) came back from the real database, then reverted the file to the original placeholder. Phase 1 is now fully done.
- Notes: `.env.local` has every key except `TAP_SALT`, which is present but empty — added to blockers; not needed until Phase 3 but should be filled in before then.
- Next: owner go-ahead to start Phase 2 (search and listing pages).

<!--
### YYYY-MM-DD
- Done: P1.4, P1.5
- Notes: anything the next session must know (gotchas, partial work, files touched)
- Next: P1.6
-->
