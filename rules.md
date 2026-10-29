# Rules for Claude Code: Dhuri Tutors

> These rules apply to every session. If a rule conflicts with a request in chat, follow the request and record the change in `tracker.md` → Decisions log.

## 1. Start and end of every session

1. **Read first, in this order:** `rules.md` → `tracker.md` → the phase you are working on in `implementation_plan.md` → any of `project_requirement_document.md`, `tech_spec.md`, `app_flow.md`, `schema.md`, `design.md` that the task touches.
2. Pick the next `[ ]` task in `tracker.md` (lowest ID in the current phase) unless the owner names a different one. Mark it `[~]`.
3. Work on **one task at a time**. Don't start the next task until the current one is `[x]`.
4. **After each task:** run `npm run typecheck`, `npm run build`, and `npm test` if tests exist. All must pass. Then mark `[x]`, update "Current status", and commit.
5. **End of session:** add a short entry to the Session log in `tracker.md` (done, notes, next).

## 2. Scope

- Build only what the docs describe. **No extra features**, pages, libraries or "nice to haves". If something seems missing, add it to "Blockers and questions" in `tracker.md` and ask.
- V0 is Phases 0–6. **Do not start Phase 7+** without the owner saying so.
- Never add: student/parent accounts, reviews or ratings, chat, payments, bookings, ads, Play Store packaging, or any paid feature (until Phase 9 is approved).
- If a spec doc is wrong or unclear, stop and ask. Don't silently deviate. If the owner agrees a change, update the relevant doc in the same commit.

## 3. Tech stack

- Use only the stack in `tech_spec.md` §1. Don't add packages without asking; if one is truly needed, state why and its size.
- Next.js 15 App Router conventions: Server Components by default; `"use client"` only for components that need state, effects or event handlers (e.g. `ContactButtons`, `ListingForm`).
- In Next.js 15, `params` and `searchParams` are Promises: `await` them.
- TypeScript strict mode. No `any` (use `unknown` and narrow). No `@ts-ignore`.
- Tailwind for all styling. Colours, spacing and type come from tokens in `globals.css` defined from `design.md`; no hard-coded hex values in components.

## 4. Data and security (non-negotiable)

- **All database access goes through `lib/data.ts`**, which imports `server-only`. No Supabase client in components, client files or route files directly.
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` or `TAP_SALT` to the browser. Never prefix them with `NEXT_PUBLIC_`. Never log them.
- **Never commit secrets.** Only `.env.example` (no real values) is committed.
- Every admin page **and** every admin server action calls `requireAdmin()` before doing anything.
- Validate every write on the server with `lib/validation.ts`, even if the client already validated.
- Public search params are checked against the lists in `lib/config.ts`; unknown values are ignored. Free-text search is cleaned to letters, digits and spaces before it reaches a query.
- RLS stays enabled on every table with no policies.
- Never store raw IP addresses. Taps store only the salted `visitor` hash.
- A listing can never be published without `consent_at`.
- Never put real teacher names or phone numbers in code, tests, seed files or commits. Fake data uses names starting with "Sample" and phones `99999000xx`.

## 5. Database changes

- Schema changes only through a **new** file in `supabase/migrations/` (`NNNN_description.sql`). Never edit an applied migration.
- Ask the owner before any change to `schema.md` tables or columns. Update `schema.md` in the same commit as the migration.
- Migrations must be safe to read: comments explaining each table and any non-obvious check.
- The owner applies migrations to Supabase. Say clearly in chat when a new migration needs to be run, and on which project (dev / prod).

## 6. Contact buttons and tap counting

- WhatsApp and Call buttons are always real links (`wa.me`, `tel:`). Tap logging is a side effect via `sendBeacon` and must never block, delay or break the contact.
- The WhatsApp prefilled message always includes the listing's ref code.
- Don't change the de-duplication rule (same listing + channel + visitor + day = 1) without updating `schema.md`.

## 7. Performance and phones

- Mobile first. Test layouts at 320 px and 390 px widths.
- No web fonts, no images in V0, no client-side data fetching on public pages.
- Public pages must work with JavaScript disabled (search via GET form; contact via plain links).
- Keep client JS small: don't make pages client components to save effort.

## 8. Code style

- Small, readable files. One component per file in `components/`.
- Names: components `PascalCase.tsx`, everything else `camelCase.ts`; route folders follow Next.js conventions.
- Comments explain **why**, not what. Add a short comment wherever a rule from these docs is being enforced (e.g. "consent required to publish").
- User-facing text: plain, short English that a parent with basic English understands. No jargon ("listing" is fine; "entity", "record" are not).
- Errors shown to users are friendly and specific ("Phone number must be 10 digits"), never raw error messages.

## 9. Git

- Commit after each completed task: `P2.3: listing page`. One task per commit.
- Don't commit broken builds.
- Don't rewrite history or force-push without asking.

## 10. Owner steps

Tasks marked **OWNER** in `tracker.md` need the owner (Supabase/Vercel accounts, real teacher data). When you reach one, stop, explain exactly what to do in numbered steps, mark it `[!]`, and continue with any later task that doesn't depend on it.

## 11. When unsure

Ask. A short question is cheaper than rework. Put open questions in `tracker.md` → "Blockers and questions for the owner".
