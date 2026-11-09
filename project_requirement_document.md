# Project Requirement Document: Dhuri Tutors

> Working title. The app name is set in one place (`NEXT_PUBLIC_APP_NAME`) so it can change later.
> Version: V0 (first release). Owner: Shahil Seth. Last updated: 2026-10-28.

## 1. Problem statement

Dhuri has no single place where students and parents can compare tuition teachers and coaching academies.

- **Students and parents** find teachers through friends, school contacts and WhatsApp groups. Fees, timings and subjects come from one phone call at a time, so comparing options is slow and uneven.
- **Teachers and academy owners** rely on the same word of mouth, plus flex boards and pamphlets. Good teachers without a big network stay hidden, and printed material goes out of date.

The app gives each teacher one shareable page with their subjects, classes, fees, timings and area, and lets parents search those pages and contact the teacher directly on WhatsApp or by phone.

## 2. Goals

1. A parent can find a relevant teacher and contact them in under a minute, on a cheap Android phone, with no login and nothing to install.
2. Each teacher gets a permanent public link (and a QR code) they can share in WhatsApp groups and print on posters.
3. Every contact tap is counted and tied to a short reference code, so the number of enquiries the app sends can be checked against what teachers actually receive.
4. The whole thing runs on free-tier services and a small codebase one person can maintain.

## 3. Non-goals for V0

- Student or parent accounts.
- Reviews and ratings (socially awkward and unreliable in a small town).
- In-app chat, bookings or payments (people will use WhatsApp).
- A Play Store app (the website opens from a link and can be added to the home screen).
- Any paid feature or monetisation (decided later, once traffic and tap data exist).
- Teacher self-sign-up (not part of V0; the V0 admin enters every listing — see F9 and Phase 8, which start after V0 launches).
- Photos on listings (V1).

## 4. Target users

| User | Who they are | What they need | Device and context |
|---|---|---|---|
| **Parent / student** (primary) | Parents of school students (Nursery–12), and students preparing for JEE/NEET/competitive exams, in Dhuri | Find a teacher by subject, class, area and mode; see fees and timings; contact them immediately | Low-to-mid Android phones, often on mobile data; arrive mostly from a link shared in WhatsApp; English/Hindi/Punjabi readers, comfortable with simple English UI |
| **Teacher / academy owner** (supply) | Home tutors, independent teachers, coaching academies | A page they can share, accurate details, enquiries from new students | Smartphone with WhatsApp; may not be comfortable filling long forms |
| **Admin / operator** | Shahil (and later a local helper) | Add and edit listings after visiting teachers, mark details as re-confirmed, see tap counts, get each teacher's link and QR | Phone or laptop; logs in with one password |
| **Local sponsor** (V2, not built now) | Book shops, stationery shops, tailors, computer institutes | A labelled sponsored slot | Not in scope for V0 |

## 5. Core features (V0)

Each feature lists what "done" means.

### F1. Search and browse listings
- Filters: subject, class, area, mode (at academy, home tuition, online), and an optional name search.
- Results show name, teacher or academy, area, fee range, subjects, classes and modes.
- Works without JavaScript (plain GET form) and search URLs can be shared.
- Only published listings for the configured city are shown.
- **Done when:** any combination of filters returns the correct published listings, and an empty result shows a helpful message.

### F2. Listing page
- One permanent, readable URL per listing: `/t/<slug>`.
- Shows: name, teacher or academy, contact person, subjects, classes, boards, fee range and fee note, timings, mode, area and address, about text, "details confirmed X days ago", and the reference code.
- Rich link preview (Open Graph title and description) when shared on WhatsApp.
- A "Share on WhatsApp" button.
- **Done when:** a shared link opens on a phone, shows a proper preview in WhatsApp, and displays all filled fields cleanly.

### F3. Contact buttons with tap counting
- **WhatsApp** button opens a chat with a prefilled message that includes the listing's reference code, e.g. *"Namaste! I found Sharma Maths Classes on Dhuri Tutors (ref D12). I'd like to know about tuition batches and fees."*
- **Call** button opens the phone dialler.
- Each tap is recorded (listing, channel, time, anonymous visitor hash). Repeat taps by the same visitor on the same listing, channel and day count once.
- Counting must never block the contact: if logging fails, the button still works.
- **Done when:** both buttons work on Android Chrome and iOS Safari, and taps appear in admin counts.

### F4. Admin: manage listings
- Password login (single admin password).
- Create and edit listings with all fields; slug and reference code generated automatically (slug editable).
- Required before a listing can be published: name, valid 10-digit phone, area, at least one subject, class and mode, and the teacher's consent recorded (timestamp stored).
- Publish / unpublish.
- "Mark verified today" button updates the last-verified date.
- **Done when:** the admin can onboard a teacher from a phone in under 5 minutes.

### F5. Admin: dashboard and stats
- List of all listings with: published status, last verified (flagged if older than 60 days), WhatsApp and call taps for the last 30 days and all time.
- **Done when:** counts match the taps table after de-duplication.

### F6. QR code per listing
- Admin can download a PNG QR code of each listing's public link, for posters and visiting cards.
- **Done when:** scanning the printed QR opens the listing page.

### F7. Installable web app
- Web app manifest and icon so the site can be added to the home screen.

### F8. Parent request form
- Public multi-step form at `/request` for parents who can't find the right teacher through search; no login, no account — ever.
- Steps: what they need (class, subjects, board, mode), where and when (area, timings, budget), their details (adult, or on behalf of a student, with a parent's name and number), then send.
- Shows a live "N teachers match" count linked straight to search before the parent ever submits — the form never hides results behind itself.
- Ends by sending a WhatsApp message to the admin with a reference code (e.g. `R12`); no SMS code, no phone verification step.
- Admin can match each request to published teachers (by area or by `serves_areas`) and forward it to a teacher on WhatsApp, without exposing the parent's number unless they agreed to share it.
- **Built in:** Phase 7, after V0 launches.
- **Done when:** a parent can submit a request from a phone in under 3 minutes, and every request appears in `/admin/requests` with its matching teachers.

### F9. Teacher sign-up form
- Public multi-step form at `/join` for teachers and academies to list themselves; no account, password, PIN or SMS code — ever.
- Steps: about you, teaching (school classes / entrance exams / skills, each its own list), profile (experience, qualification, fees, languages), a real preview of the public listing page, then send.
- Saved unpublished (`source='self'`) until the admin reviews it; replaces the old "approval queue" idea — sign-ups land straight in the normal listings table instead of a separate queue.
- Admin approves (publishes the listing and issues a private edit link) or rejects, from the dashboard.
- **Built in:** Phase 8, after V0 launches.
- **Done when:** a teacher can sign up from their own phone in under 10 minutes, and the admin can approve or reject every sign-up from the dashboard.

## 6. Later versions (for context, not built in V0)

| Version | Adds |
|---|---|
| **V1** | Photos on listings; monthly stats message to teachers; monthly WhatsApp re-confirm reminder. (Teacher self-submit and the private edit link moved earlier — see F9 and Phase 8.) |
| **V2** | Paid options only after steady traffic: featured listings, admission-season boost, up to 3 labelled sponsor slots |
| **V3** | Second town (e.g. Sangrur, Malerkotla, Barnala) using the same codebase via the `city` field |

## 7. Success metrics

**V0 launch criteria**
- 5–10 real listings live, each with recorded consent.
- Search, listing pages and both contact buttons working on real phones.
- Taps recorded with reference codes.

**Measured after launch (monthly)**
- Unique visitors (Vercel Analytics or similar).
- Unique contact taps per listing.
- Teacher-confirmed enquiries: ask each teacher monthly how many enquiries mentioned the app or a ref code.
- Number of live listings (target 20–30 before sharing widely with parents).
- Parent requests submitted per month (from `/request`), and how many were matched to a teacher.
- Subject, class and village combinations with no matching teacher, from the admin's "No teacher found" report.

**Stop / rethink condition** (to be fixed by the owner before launch): e.g. *"If after 8 weeks fewer than N teachers confirm at least one enquiry from the app, rethink the approach."*

## 8. Assumptions

- Teachers in V0 are onboarded in person by the admin, with their consent.
- Parents mostly arrive through links shared in WhatsApp groups and statuses, and QR posters.
- Most teachers are willing to show at least a fee range or a fee note.

## 9. Risks (summary)

| Risk | Mitigation in V0 |
|---|---|
| Too few listings for search to be useful | Share widely only after 20–30 real listings in the busiest subjects |
| Listings go out of date | "Last confirmed" date shown; admin flag after 60 days |
| Tap counts overstate real enquiries | Ref code in WhatsApp message; de-duplication; monthly teacher check |
| Phone numbers scraped | Accept for V0; tap-to-reveal planned if abuse appears |
| Fake listings | Only the admin can create listings in V0 |
| Personal data / consent | Consent timestamp required before publishing |
| One-person team | Free-tier services, small codebase, no features outside this document |

## 10. Open questions (owner to answer)

1. Final app name and domain.
2. Final subject and class lists.
3. The stop condition numbers in section 7.
4. Should the UI include Hindi or Punjabi labels in V0?

(Resolved 2026-11-09: full list of Dhuri town + nearby villages for the area filter — see `tracker.md` Decisions log and `implementation_plan.md` P0.9.)
