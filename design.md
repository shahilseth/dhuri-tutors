# Design: Dhuri Tutors

> Visual rules for every screen. Claude Code: build the tokens in §3 into `app/globals.css` under `@theme`, and use only those tokens in components (no raw hex values).
> Screens and their contents are defined in `app_flow.md`; this file defines how they look.

## 1. Who we're designing for

- **Parents** in Dhuri, many 35–55, reading on a budget Android phone, often outdoors or in a shop, often on slow mobile data. Comfortable with WhatsApp; not with "apps".
- **Teachers and academy owners** who will judge the page that represents them, and decide whether it looks respectable enough to share.

What they trust: things that look **official, plain and orderly**: a school admission form, a bank passbook, a printed directory. What they distrust: anything that looks like an ad, a loan app or a scam: bright gradients, flashing badges, pop-ups, too many colours.

## 2. Design idea: "blue ink on a clean register"

Every student in Punjab writes in blue ballpoint on white ruled paper. The app borrows that look: **one deep ballpoint blue on white**, thin ruled lines between entries, black-blue text, and nothing else competing for attention. It should feel like a neat, well-kept register of teachers, not a startup.

- **One colour does the work.** Blue for anything you can tap. Green only on the WhatsApp button (people recognise it instantly). Everything else is ink and grey.
- **Rows, not floating cards.** Results are entries in one ruled list, like a directory, so the page reads as one trustworthy record rather than a pile of ads.
- **One memorable detail:** the details section on a listing page is drawn like a sheet from an exercise book, with a thin red margin line on the left. Used there only, nowhere else.
- **Facts first, no selling.** Fees, timings and classes are shown plainly and aligned so they're easy to compare. No adjectives like "best", "top", "expert".

## 3. Colour tokens

| Token | Hex | Use |
|---|---|---|
| `page` | `#EEF1F5` | Page background behind content (cool light grey; not cream) |
| `paper` | `#FFFFFF` | Content surfaces: header, search form, result list, details sheet, inputs |
| `ink` | `#1A2233` | Main text, headings |
| `ink-2` | `#4A5468` | Secondary text: area, classes, labels in details |
| `ink-3` | `#6B7486` | Quiet text only: "Details confirmed 3 days ago", ref code, placeholders, footer. Never for anything the user must read to decide |
| `rule` | `#D3D9E2` | All borders and divider lines |
| `blue` | `#1F3C88` | Primary: links, Call button, Search button, focus ring, selected states, header name |
| `blue-hover` | `#18306E` | Hover/pressed for blue buttons |
| `blue-tint` | `#E7ECF6` | Subject tags, selected filter background, admin "Live" badge background |
| `wa` | `#17784A` | WhatsApp button only (darker than WhatsApp's brand green so white text passes contrast) |
| `margin` | `#C0504D` | The red margin line on the listing details sheet. Nowhere else |
| `amber` | `#8A5300` | Warnings text: stale listing, unsaved, demo mode |
| `amber-tint` | `#FBF1DE` | Warning backgrounds |
| `danger` | `#A8322A` | Form errors, "Unpublish" confirmation |

Checked contrast (WCAG AA needs 4.5 for normal text): ink on paper 15.9 · ink-2 on paper 7.6 · ink-3 on paper 4.7 · blue on paper 10.2 · white on blue 10.2 · white on wa 5.5 · amber on amber-tint 5.7 · danger on paper 6.7. **Don't introduce new colours**; if one seems needed, ask.

Dark mode: not in V0. The site always renders light (`color-scheme: light`).

```css
@theme {
  --color-page: #EEF1F5;
  --color-paper: #FFFFFF;
  --color-ink: #1A2233;
  --color-ink-2: #4A5468;
  --color-ink-3: #6B7486;
  --color-rule: #D3D9E2;
  --color-blue: #1F3C88;
  --color-blue-hover: #18306E;
  --color-blue-tint: #E7ECF6;
  --color-wa: #17784A;
  --color-margin: #C0504D;
  --color-amber: #8A5300;
  --color-amber-tint: #FBF1DE;
  --color-danger: #A8322A;

  --font-sans: Roboto, "Noto Sans", "Noto Sans Gurmukhi", "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", sans-serif;

  --radius-sm: 4px;
  --radius-md: 6px;
}
```

## 4. Typography

**No web fonts** (speed on slow data). The stack uses Roboto, which every Android phone already has; Noto Gurmukhi/Devanagari are in the stack so Punjabi and Hindi names render properly.

| Role | Size / line height | Weight | Notes |
|---|---|---|---|
| Page title (h1) | 22px / 28px | 700 | One per page. Left aligned |
| Listing name on listing page (h1) | 24px / 30px | 700 | |
| Section heading (h2) | 17px / 24px | 600 | |
| Result name | 17px / 24px | 600 | |
| Body | 16px / 24px | 400 | Minimum for anything a parent reads |
| Secondary | 15px / 22px | 400 | `ink-2` |
| Small | 13px / 18px | 400 | `ink-3`; ref code, confirmed date, footer only |
| Button | 16px | 600 | |
| Fees | 16px | 600 | `font-variant-numeric: tabular-nums` so amounts line up |

Rules:
- **Sentence case everywhere.** No ALL-CAPS labels, no letter-spaced eyebrow text above headings.
- Don't colour or italicise single words inside a headline.
- Money: `₹1,500` with Indian digit grouping (`toLocaleString("en-IN")`). Ranges: `₹800 to ₹1,500 a month`.
- Classes: "Class 9 to 12" for a continuous range, otherwise "Class 6, 8, 10".
- Keep text left aligned. Center only the empty state and the not-found page.
- Line length for paragraphs (about text): max ~65 characters (`max-w-prose`).

## 5. Layout and spacing

- Mobile first. Content column `max-width: 640px`, side padding 16px. Works at 320px.
- Spacing scale (px): 4, 8, 12, 16, 24, 32. Between page sections: 24. Inside a row: 12–16.
- **Borders, not shadows.** No `box-shadow` anywhere except the 2px focus ring.
- Radius: 6px on buttons, inputs, the search form and the result list container; 4px on tags. Rows inside a list have no radius. Never fully rounded (`rounded-full`) buttons or tags.
- Tap targets ≥ 48px tall for contact buttons, ≥ 44px for everything else.
- No images, illustrations, icons libraries, gradients, blur or emoji in V0. The only icons allowed: a simple inline-SVG phone handset and a check mark, 18px, `currentColor`.
- No motion except a 120ms colour change on button press. Respect `prefers-reduced-motion`.

## 6. Components

### Header (all public pages)
White bar, 1px `rule` bottom border, 56px tall. App name left in `blue`, 18px/700. City name right in `ink-2`, 15px. No menu, no logo graphic in V0.

```
┌──────────────────────────────────────┐
│ Dhuri Tutors                   Dhuri │
└──────────────────────────────────────┘
```

### Search form (home)
White box, 1px `rule` border, 6px radius, 16px padding. Labels above fields (15px, `ink`, 500). Two columns for the four dropdowns at ≥ 360px, one column below. Name field full width. **Search** button full width, `blue`. "Clear filters" is a text link in `blue` under the button, shown only when filters are set.

Inputs and selects: white, 1px `rule` border, 6px radius, 48px tall, 16px text (prevents iOS zoom). Focus: border `blue` + 2px `blue` ring at 25% opacity.

### Result list (home)
A count line above the list: "4 teachers found" (15px, `ink-2`).

One white container with 1px `rule` border and 6px radius; each result is a row separated by a 1px `rule` line. The whole row is the link. Pressed state: background `blue-tint`.

```
┌──────────────────────────────────────┐
│ Sharma Maths Classes                 │
│ Teacher, Main Bazaar                 │
│ ₹800 to ₹1,500 a month               │
│ [Maths] [Physics]                    │
│ Class 9 to 12. At academy, home      │
├──────────────────────────────────────┤
│ Gyan Science Academy                 │
│ ...                                  │
└──────────────────────────────────────┘
```

- Line 1: name (17px/600 `ink`), full width so long names never get squeezed.
- Line 2: "Teacher" or "Academy", then area (15px `ink-2`).
- Line 3: fee (16px/600 `ink`, tabular numbers), with "a month" in 15px/400 `ink-2`. Fees sit at the same position in every row, so they're easy to compare while scrolling.
- Line 4: subject tags.
- Line 5: classes and mode (15px `ink-2`).
- If no fee is given: show "Fee on request" in 15px `ink-3` on line 3.
- Separate facts with commas and full stops, not with `·` middle dots.

### Subject tag
`blue-tint` background, `blue` text, 13px/500, 4px radius, padding 2px 8px. Not clickable. No other tag colours.

### Listing page

```
┌──────────────────────────────────────┐
│ ‹ All teachers                       │
│                                      │
│ Sharma Maths Classes                 │  h1
│ Teacher, run by R. K. Sharma         │  ink-2
│ [Maths] [Physics]                    │
│                                      │
│ ┌───────────────┐ ┌────────────────┐ │
│ │   WhatsApp    │ │  ☏  Call       │ │  48px, side by side
│ └───────────────┘ └────────────────┘ │
│                                      │
│ ┃ Classes   Class 9 to 12            │  details sheet:
│ ┃───────────────────────────────────│  white, rule lines,
│ ┃ Board     PSEB, CBSE               │  red margin line on left
│ ┃───────────────────────────────────│
│ ┃ Fees      ₹800 to ₹1,500 a month   │
│ ┃           per subject              │
│ ┃───────────────────────────────────│
│ ┃ Timings   Mon to Sat, 4 to 8 pm    │
│ ┃ Mode      At academy, home tuition │
│ ┃ Area      Near bus stand, Main     │
│ ┃           Bazaar, Dhuri            │
│                                      │
│ About                                │  h2
│ Teaching maths for 12 years...       │
│                                      │
│ ✓ Details confirmed 3 days ago       │  ink-3, 13px
│ Ref D12                              │
│                                      │
│ [ Share this page on WhatsApp ]      │  outline button
└──────────────────────────────────────┘
```

- **WhatsApp** button: `wa` background, white text. **Call** button: `blue` background, white text, phone icon. Equal width, side by side, placed **above** the details so contact is one tap from arriving.
- **Details sheet:** white, 1px `rule` border, 6px radius on the right corners only, and a **2px `margin` red line on the left edge** (the exercise-book margin). Rows: label column 96px wide in `ink-2`, value in `ink`, 1px `rule` line between rows, 12px vertical padding.
- "Details confirmed X ago" with a check icon in `ink-3`. If older than 60 days, show it in `amber` without the check: "Details last confirmed 3 months ago. Please confirm with the teacher."
- Share button: white background, 1px `rule` border, `blue` text, full width.

### Buttons

| Type | Look | Used for |
|---|---|---|
| Primary | `blue` bg, white text, 6px radius, 48px tall | Search, Call, Save, Log in |
| WhatsApp | `wa` bg, white text | WhatsApp only |
| Secondary | white bg, 1px `rule` border, `blue` text | Share, Cancel, Download QR, Mark verified today |
| Text link | `blue`, underline on press/hover | Clear filters, All teachers, Edit |
| Danger (admin) | white bg, 1px `danger` border, `danger` text | Unpublish |

Disabled: 50% opacity. While a form submits: label changes to "Saving…" and the button disables.

### Empty state
Centered text in the result-list container, 24px padding: "No teachers match these filters yet." and a text link "Clear filters". No illustration.

### Not found page
"This page isn't available. The teacher may no longer be listed." + primary button "See all teachers".

### Footer
13px `ink-3`, left aligned, 24px top padding: "Are you a teacher in Dhuri? Get listed for free. Message us on WhatsApp." with the last part as a `blue` link.

## 7. Admin screens

Same tokens, denser layout; admin is used by one person on a phone or laptop.

- Header: "Admin" in `ink`, links "Listings", "Add listing", "Log out" in `blue`.
- Dashboard top line in 15px `ink-2`: "7 live, 1 hidden, 2 need re-confirming".
- Listing rows (same ruled-list style as public results):
  - Line 1: name (600) and status badge. **Live**: `blue-tint` bg, `blue` text. **Hidden**: white bg, `rule` border, `ink-2` text. 4px radius, 13px.
  - Line 2: "Ref D12. Confirmed 3 days ago." Stale: amber text "Not confirmed for 74 days".
  - Line 3: "WhatsApp 12, calls 4 in last 30 days (38, 9 total)", tabular numbers.
  - Actions as secondary buttons in a row: Edit, Mark verified today, Download QR, View page.
- Form: one column, labels above fields, checkbox groups as a 2-column grid of 44px tall options with visible checkboxes. Field errors in `danger` 14px directly under the field; the field border turns `danger`.
- Consent checkbox in a bordered box with `amber-tint` background until ticked: "The teacher agreed to be listed on this site." Once ticked: "Consent recorded on 28 Oct 2026" in `ink-2`.

## 8. Writing

- Plain words a parent with basic English understands. Short sentences.
- Names of actions stay the same everywhere: "WhatsApp", "Call", "Search", "Save", "Publish", "Unpublish", "Mark verified today".
- No "Discover", "Find the perfect", "Unlock", "Top-rated", "Best", "Expert", "Seamless", no exclamation marks, no emoji.
- Errors say what to fix: "Phone number must be 10 digits."
- Home page title: "Tuition teachers in Dhuri". Supporting line: "Search by subject, class and area. Call or WhatsApp the teacher directly."

## 9. Things that make it look AI-generated: don't do them

- Gradients, glows, glassmorphism, blurred blobs, decorative background shapes.
- Purple, indigo, violet, neon green, or any second accent colour.
- Cream/beige page background with a terracotta accent.
- Every block in its own floating rounded card with a soft shadow.
- Fully rounded pill buttons and pill tags.
- Big hero sections, stat counters ("500+ teachers"), testimonial blocks, "How it works" with 01/02/03 steps.
- ALL-CAPS labels, letter-spaced eyebrow text, `·` separators joining meta text, `→` arrows appended to buttons.
- Icon in front of every label.
- Fade-in or slide-up animations on scroll.
- Placeholder copy like "Lorem ipsum" or marketing filler.

## 10. Accessibility checklist

- All text pairs in §3 meet WCAG AA; don't put `ink-3` on `page` for body text.
- Visible focus ring on every interactive element (2px `blue`, 2px offset).
- Every input has a `<label>`; checkbox groups use `<fieldset>` + `<legend>`.
- Buttons are `<button>` or `<a>`, never clickable `<div>`s.
- `lang="en"` on `<html>`; teacher names in Punjabi/Hindi render via the Noto fallbacks.
- Usable at 200% zoom and at 320px width without horizontal scrolling.
