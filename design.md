# Design: Dhuri Tutors (PWA)

> Visual rules for every screen of the app: public pages, the parent request form, the teacher sign-up form, admin, and the installed PWA.
> Claude Code: put the tokens in §3 into `app/globals.css` under `@theme`, and use only those tokens in components. No raw hex values in components.
> Screens and their contents are defined in `app_flow.md`; this file defines how they look. `design-preview.png` shows the target look.

## 1. Direction

**Calm, official, blue.** The layout follows teacherparent.in: bold headings, big rounded white cards on a very light blue page, a numbered step bar on forms, roomy inputs, reassuring privacy notes, and a dark navy "What happens next" panel. All the colour comes from **one blue family plus white**. Nothing else competes, so the page reads as trustworthy rather than salesy.

Who it's for: parents (often 35–55, budget Android phones, slow data, arriving from WhatsApp links) and local teachers who must feel their page looks respectable enough to share.

Three rules that keep it clean:
1. **Blue means "you can tap this".** Body text is navy ink, never blue.
2. **One strong element per screen**: the main button (or the WhatsApp/Call bar on a listing). Everything else is quiet.
3. **White space over decoration.** No illustrations, stock photos, emoji, or extra colours.

## 2. What stays exactly like the reference

- Small letter-spaced eyebrow above each page title ("Build your teacher profile").
- Heavy, tight page titles (800 weight, negative letter-spacing).
- 4px step bar with numbered circles and labels underneath.
- Large white form card with 22px radius and a soft shadow.
- 54px tall inputs with 12px radius; bold labels above; small grey help text below.
- Option boxes for radios/checkboxes (bordered tiles that fill light blue when selected).
- Segmented tabs (School / Entrance exams / Skills and activities).
- Light-blue info boxes for privacy notes.
- Dark navy side panel "What happens next" with tick list.
- Row of small ✓ trust notes under the card.
- Review page: one bordered section per step with an underlined **Edit** link on the right.
- Header: logo + two-tone wordmark left, pill button "Join as a teacher" right.

**Changed from the reference:** green → blue throughout; the button gradient is blue-to-blue (very subtle), not teal-to-green; no "→" arrows on buttons (the label already says where it goes).

## 3. Colour tokens

Blue family + white. Functional colours (WhatsApp green, error red, warning amber) appear only where the meaning needs them.

| Token | Hex | Use |
|---|---|---|
| `white` | `#FFFFFF` | Cards, header, inputs, sticky bars |
| `bg` | `#F5F8FD` | Page background |
| `bg-glow` | `#E3EDFC` | Soft radial glow in the top-right corner of the page background only |
| `tint` | `#EAF1FC` | Selected option boxes, tags, info boxes, header pill, inactive step circles |
| `tint-2` | `#DCE8FA` | Inactive step bar, info box border, disabled button bg, focus halo |
| `line` | `#D5DEEB` | All borders and dividers, input borders |
| `ink` | `#0F2445` | Headings and main text (deep navy) |
| `ink-2` | `#4A5A74` | Secondary text, lede, labels inside key-value lists |
| `ink-3` | `#5F6D86` | Help text, placeholders, small meta, trust notes |
| `blue-800` | `#163B7A` | Pressed state, gradient end on logo mark |
| `blue-700` | `#1C4FA6` | **Primary**: buttons, links, active step, selected radio, tags text |
| `blue-600` | `#2563C9` | Button gradient top, focus border, eyebrow text, completed step bar |
| `blue-500` | `#3C7BE0` | Decorative only (panel glow). Never text |
| `sky` | `#4A90E2` | Second half of the wordmark only (large bold text) |
| `navy` | `#0D2142` | "What happens next" panel background |
| `ice` | `#A9CBFF` | Eyebrow and ticks on the navy panel |
| `wa` | `#167A47` | WhatsApp button only |
| `danger` | `#B42318` | Errors, Reject/Unpublish |
| `amber` | `#8A5300` | Warning text (stale listing, demo mode) |
| `amber-tint` | `#FDF3E1` | Warning background |

Contrast checked (WCAG AA needs 4.5:1 for normal text): ink on white 15.5 · ink-2 on white 7.0 · ink-3 on white 5.2, on bg 4.9 · blue-700 on white 7.7, on tint 6.8 · white on blue-700 7.7 · white on blue-600 5.7 · white on navy 16.0 · ice on navy 9.7 · white on wa 5.4 · danger on white 6.6 · amber on amber-tint 5.8. `sky` (3.3) and `blue-500` (4.1) are only allowed for large bold text or decoration.

**Why WhatsApp stays green:** parents recognise the green button instantly. It's the single non-blue colour on public pages.

```css
@theme {
  --color-white: #FFFFFF;
  --color-bg: #F5F8FD;
  --color-bg-glow: #E3EDFC;
  --color-tint: #EAF1FC;
  --color-tint-2: #DCE8FA;
  --color-line: #D5DEEB;
  --color-ink: #0F2445;
  --color-ink-2: #4A5A74;
  --color-ink-3: #5F6D86;
  --color-blue-800: #163B7A;
  --color-blue-700: #1C4FA6;
  --color-blue-600: #2563C9;
  --color-blue-500: #3C7BE0;
  --color-sky: #4A90E2;
  --color-navy: #0D2142;
  --color-ice: #A9CBFF;
  --color-wa: #167A47;
  --color-danger: #B42318;
  --color-amber: #8A5300;
  --color-amber-tint: #FDF3E1;

  --font-sans: "Inter Variable", Inter, "Noto Sans Gurmukhi", "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --radius-sm: 8px;    /* tags */
  --radius-md: 12px;   /* inputs, buttons, option boxes, info boxes */
  --radius-lg: 18px;   /* cards on mobile */
  --radius-xl: 22px;   /* form card and navy panel on desktop */

  --shadow-card: 0 1px 2px rgb(15 36 69 / 0.04), 0 12px 32px -12px rgb(15 36 69 / 0.12);
  --shadow-btn: 0 8px 20px -8px rgb(28 79 166 / 0.55);
  --shadow-wa: 0 8px 20px -10px rgb(22 122 71 / 0.6);
}
```

Page background:
```css
body {
  background-color: var(--color-bg);
  background-image: radial-gradient(900px 500px at 100% 0%, var(--color-bg-glow), transparent 60%);
  background-attachment: fixed;
  color: var(--color-ink);
  color-scheme: light;
}
```

Dark mode: not in V0. Always render light.

## 4. Typography

**One font: Inter (variable)**, self-hosted through `next/font/google` (`subsets: ["latin"]`, `display: "swap"`, CSS variable `--font-inter`). About 30–40 KB, cached after first visit. Punjabi and Hindi text falls back to the phone's Noto fonts.

| Role | Mobile | Desktop (≥ 768px) | Weight | Extra |
|---|---|---|---|---|
| Eyebrow | 12.5px | 12.5px | 700 | `uppercase`, `letter-spacing: 0.14em`, `blue-600` |
| Page title h1 | 30px / 1.1 | 40px / 1.1 | 800 | `letter-spacing: -0.025em` |
| Listing name h1 | 28px / 1.15 | 36px / 1.1 | 800 | `-0.025em` |
| Lede (under title) | 16px / 1.55 | 17px / 1.55 | 400 | `ink-2`, max 640px wide |
| Card heading h2 | 15–17px | 17px | 700 | |
| Panel heading | 20px | 22px / 1.25 | 700 | white on navy |
| Label | 15px | 15px | 600 | `ink` |
| Body / input text | 16px | 16px | 400 | Never smaller than 16px in inputs (stops iOS zoom) |
| Secondary | 14.5px | 14.5px | 400 | `ink-2` |
| Help / meta | 13px | 13px | 400 | `ink-3` |
| Button | 16px | 16px | 700 | |
| Money | 16px | 16px | 700 | `font-variant-numeric: tabular-nums` |

Copy rules: sentence case for everything except the eyebrow. Money as `₹1,500` (`toLocaleString("en-IN")`); ranges "₹800 to ₹1,500 a month". Classes "Class 9 to 12". No exclamation marks, emoji, "best", "top-rated", "expert".

## 5. Layout

- Mobile first. Page padding 16px (mobile), 24px (≥ 768px), 40px (≥ 1024px).
- Max widths: public pages 720px; forms 1120px (card + 300px side panel at ≥ 1024px).
- Spacing scale: 4, 8, 12, 16, 20, 24, 28, 32, 40. Between title block and step bar 28px; step bar to card 28px; between fields 20px.
- Two-column field grid inside form cards at ≥ 768px; single column below.
- Works at 320px with no horizontal scroll and at 200% zoom.
- Safe areas: sticky bottom bars use `padding-bottom: calc(12px + env(safe-area-inset-bottom))`.

## 6. Components

### Header
White, 1px `line` bottom border, 64px desktop / 58px mobile, sticky on scroll.
- Left: logo mark (34px rounded square, 10px radius, gradient `blue-600` → `blue-800`, white mortarboard line icon) + wordmark **Dhuri** in `blue-700` and **Tutors** in `sky`, 20px/800 (18px mobile), no space between.
- Right: pill link "Join as a teacher" (`tint` bg, `blue-700` text, 14px/700, fully rounded, 9px 16px padding). On admin pages: Listings, Requests, Log out as text links.

### Eyebrow + title block
Eyebrow, then h1 10px below, then lede 12px below. Left aligned on every screen.

| Screen | Eyebrow | Title |
|---|---|---|
| Home | Dhuri and nearby villages | Find a tuition teacher near you |
| Join step 1 | Build your teacher profile | Tell us about yourself |
| Join step 2 | Build your teacher profile | What and how do you teach? |
| Join step 3 | Build your teacher profile | Add your teaching experience |
| Join step 4 | Build your teacher profile | Check your page |
| Join step 5 | Build your teacher profile | Send for approval |
| Request step 1 | Find the right teacher | Tell us what your child needs |
| Request step 2 | Find the right teacher | Where and when |
| Request step 3 | Find the right teacher | Your details |
| Request step 4 | Find the right teacher | Send your request |

Listing pages, results and admin have no eyebrow.

### Step bar
Grid of equal columns (5 for join, 4 for request), 10px gap.
- Each step: 4px top bar, 12px gap, then a 28px circle with the number + label (14px/600).
- Future: bar `tint-2`, circle `tint` with `ink-3` number, label `ink-2`.
- Current: bar `blue-600`, circle `blue-700` with white number and a 4px `tint-2` halo, label `ink`.
- Done: bar `blue-600`, circle `blue-700` with white number, label `ink-2`. Done steps are links back to that step.
- Mobile (< 560px): hide labels except the current one; show "Step 2 of 5" under the bar in `ink-3` 13px.

### Card
`white`, 1px `line` border, `radius-xl` (desktop) / `radius-lg` (mobile), `shadow-card`, padding 36px desktop / 20px mobile. Used for: form step body, search filters, result items, listing detail sections, review sections, admin rows.

### Inputs and selects
54px tall, 1.5px `line` border, `radius-md`, white, 16px padding, 16px text. Placeholder `ink-3`.
- Focus: border `blue-600` + `0 0 0 4px rgb(37 99 201 / 0.15)` halo.
- Error: border `danger`, message 13.5px `danger` below the field, starting with the field name ("Mobile number must be 10 digits.").
- Phone input: "+91" prefix inside the field, separated by a 1.5px `line` divider.
- Select: custom chevron in `ink-2`; native dropdown list.
- Optional fields: "(optional)" after the label in 400 `ink-3`.
- Textarea: min 120px, same styling, live character count bottom-right in `ink-3`.

### Option boxes (radio and checkbox)
Bordered tiles, 54px min height, `radius-md`, 1.5px `line` border, 16px padding, 600 label, control on the left.
- Selected: border `blue-600`, background `tint`; radio shows a `blue-700` ring dot; checkbox fills `blue-700` with a white tick.
- Grid: 2 columns on mobile, 3 on desktop (mode, languages); 1 column for long labels.
- Use real `<input>` elements visually restyled; the whole tile is the `<label>`.

### Segmented tabs (teaching type)
Container: white, 1.5px `line` border, 14px radius, 6px padding. Tabs equal width, 46px tall, 10px radius, 15px/700 `blue-700` text. Active tab: `blue-700` background, white text. Under 560px the tabs scroll horizontally. Use `role="tablist"`.

### Search-as-you-type (subjects)
Input with placeholder "Type 2 letters, e.g. Maths". Matches appear as a list of checkbox option rows under the input (max 8). Chosen subjects show as removable tags above the input ("Maths ×").

### Teaching list (join step 2)
Heading "Your teaching list". Empty: "No teaching details added yet." in `ink-3`. Each entry is a row in a bordered box: bold "Class 9 to 12" + subjects in `ink-2`, "Remove" text link in `danger` on the right. The "Add teaching details" box below uses a nested card with `bg` background and 16px radius.

### Buttons

| Type | Style | Used for |
|---|---|---|
| Primary | 54px tall, `radius-md`, white 16px/700 text, `linear-gradient(180deg, blue-600, blue-700)`, `shadow-btn`. Pressed: `blue-800`, no shadow | Continue, Search, Call, Save, Send |
| WhatsApp | Same shape, `wa` bg, `shadow-wa`, WhatsApp glyph (inline SVG, 20px) | WhatsApp contact, "Send on WhatsApp" final step |
| Secondary | 54px, white bg, 1.5px `line` border, `blue-700` text, no shadow | Share, Download QR, Find, Mark verified today |
| Pill | `tint` bg, `blue-700`, fully rounded, 40px | Header "Join as a teacher" |
| Text link | `ink-2` 600 for "‹ Back"; `blue-700` underlined for Edit, Clear filters | |
| Danger | White bg, 1.5px `danger` border, `danger` text | Reject, Unpublish |
| Disabled | `tint-2` bg, `ink-3` text, no shadow, `cursor: not-allowed` | Continue before required fields are filled |

Form footer row: "‹ Back" text link on the left, primary button on the right. On mobile the primary button is full width and Back sits above it, centered. While submitting: label "Saving…" and disabled.

### Info box
`tint` background, 1px `tint-2` border, 14px radius, 14px 16px padding, 14.5px `ink-2` text with a bold `ink` lead-in ("**Your privacy.** …"). Warning variant: `amber-tint` bg, `amber` text. Error summary: white bg, 1.5px `danger` border.

### "What happens next" panel
`navy` background, 22px radius, 28px padding, white text. A faint `blue-500` radial glow in the top-right corner (decorative). Eyebrow in `ice`, heading 22px/700 white, 3 tick items (14.5px, `#DCE6F7` text, `ice` ticks).
- Desktop ≥ 1024px: right column, 300px wide, sticky at `top: 96px`.
- Mobile: placed **under** the form card, full width, 18px radius.

Content:
- Join: "Your own page, ready to share on WhatsApp." · We check your details and publish your page within 2 days. · You get a link and QR code for posters and WhatsApp status. · Parents call or WhatsApp you directly. No commission.
- Request: "One request, matched by a local team." · We reply on WhatsApp within 24 hours. · We share your need only with matching teachers. · You can still search and contact teachers yourself.

### Trust notes row
Under the form card, centered, wraps on mobile, 13.5px `ink-3`, each item prefixed with a `blue-600` ✓. Join: "Your progress is saved on this phone", "Free to join", "Checked by our team before publishing". Request: "Your progress is saved on this phone", "Free for parents", "Your number is shared only with your permission".

### Review sections (join step 4, request step 4)
One card per step: title (15px/700) left, "Edit" (`blue-700`, underlined, 14px) right. Content as a 2-column key-value grid: key 13px `ink-3`, value 15px/600 `ink`. Join step 4 additionally shows "This is what parents will see" followed by the real listing card and listing page sections rendered in a `tint` frame with 18px radius.

### Final "Send" step
Info box at top: "Last step. Tap the button to send this to us on WhatsApp. This confirms your number." Then a summary card, the consent checkbox as an option box, then the full-width WhatsApp button "Send on WhatsApp". After tapping, show a success state in the card: a 56px `tint` circle with a `blue-700` tick, heading "Sent", one line on what happens next, and a secondary button "Back to search".

### Home and search
1. Title block.
2. Subject quick chips: horizontal scroll row, fully rounded, 1.5px `line` border, white, 14.5px/600 `ink`. Selected: `blue-700` bg, white text. First 4 popular subjects + "More" (opens the subject select).
3. Filter card: Class and Area selects side by side, then "More filters" (Mode, Board, name) collapsed behind a text button. Filters apply on change (JS) with a Search button as no-JS fallback.
4. Count row: "6 teachers found" (`ink-2`) left, "Filters" link right (scrolls to filter card).
5. Result cards (one card per teacher, 14px gap):
   - Name 17.5px/700 `ink`, `-0.01em`.
   - "Teacher in Dhuri town · comes to Bamal" 14.5px `ink-2`.
   - Fee 16px/700 tabular + "a month" 14.5px `ink-2`; or "Fee on request" `ink-3`.
   - Subject tags: `tint` bg, `blue-700` text, 13px/600, `radius-sm`, 4px 10px.
   - "Class 9 to 12. Home tuition, at academy." 14.5px `ink-2`.
   - Whole card is the link; pressed: border `blue-600`.
6. Empty state card: "No teachers match yet." + secondary button "Tell us what you need" (to /request) + text link "Clear filters".
7. Below results: a `tint` info box "Can't find the right teacher? Tell us what you need and we'll find one." with a primary button.

### Listing page
1. "‹ All teachers" (`blue-700`, 15px/600).
2. Name h1, then "Run by R. K. Sharma, 12 years teaching" (`ink-2`), then a confirmed badge: `tint` pill, `blue-700` 12.5px/600 "✓ Details confirmed 3 days ago". If older than 60 days: `amber-tint` pill, `amber` text "Details last confirmed 3 months ago".
3. Subject tags.
4. Optional headline in 17px `ink`.
5. Cards with 2-column key-value grids: **Fees and classes** (monthly fee, classes, board, timings), **Where** (teaches from, comes to, mode, languages), **About** (paragraph, max 65ch), **Teaching list** (entries as in the join form, read-only).
6. Small meta line: "Ref D12" `ink-3`.
7. Secondary button "Share this page on WhatsApp".
8. **Sticky contact bar** at the bottom: white 96% opacity, 1px `line` top border, WhatsApp and Call side by side, 10px gap. Always visible while scrolling. Leave 96px bottom padding on the page so content isn't hidden.

### Tags
`tint` bg, `blue-700` text, 13px/600, `radius-sm` (8px), 4px 10px. Removable variant (forms) adds "×" button with `aria-label="Remove Maths"`.

### Admin
Same tokens; denser.
- Dashboard: 3 stat tiles in a row (white cards, 18px radius): "Live listings", "New sign-ups", "New requests"; number 28px/800 `ink`, label 13px `ink-3`. Tiles link to their lists. No other stat styling.
- Lists: one card per item. Status badges as pills: Live (`tint`/`blue-700`), Hidden (white, `line` border, `ink-2`), New (`blue-700` bg, white), Stale (`amber-tint`/`amber`), Rejected (white, `danger` border, `danger`).
- Tap numbers: "WhatsApp 12 · Calls 4 in 30 days" tabular, `ink-2`.
- Row actions as secondary buttons (40px tall in admin), wrapping.
- Toggles (publish): 44×26px track, `tint-2` off / `blue-700` on, white 20px thumb; always paired with a visible text label.

### Toast
Bottom-center (above the sticky bar), `navy` bg, white 14.5px text, 12px radius, 12px 16px padding, auto-hide 3s, `role="status"`. Used for "Link copied", "Saved", "Marked as verified".

### Skeletons and loading
Server-rendered pages need no spinners. Inside forms (live match count, subject search) show a 14px `tint-2` shimmer bar or the text "Checking…" in `ink-3`. Respect `prefers-reduced-motion` (no shimmer).

## 7. Icons
Inline SVG line icons, 1.8–2.2px stroke, `currentColor`, 18–20px: mortarboard (logo), phone, WhatsApp glyph, tick, chevron, back chevron, share, QR, location pin, clock. No icon library and no icon in front of every label; icons only on buttons, ticks and the logo.

## 8. Motion
- Button press: background change 120ms.
- Option box select: border/background 120ms.
- Step change: content fades in over 150ms (no sliding).
- Toast: fade/slide up 8px over 160ms.
- Nothing animates on page load or on scroll. All motion off under `prefers-reduced-motion: reduce`.

## 9. PWA

| Item | Value |
|---|---|
| `name` / `short_name` | "Dhuri Tutors" / "Dhuri Tutors" |
| `theme_color` | `#FFFFFF` (matches the white header, so the status bar blends in) |
| `background_color` | `#F5F8FD` |
| `display` | `standalone` |
| `start_url` | `/?source=pwa` |
| Icons | 192px and 512px PNG + 512px maskable: logo mark (mortarboard) white on `blue-700`, 20% safe padding for maskable; `apple-touch-icon` 180px |
| Splash | Generated from `background_color` + icon; no custom splash images |
| Install prompt | After the second visit or after a contact tap, show a dismissible bottom card: "Add Dhuri Tutors to your home screen" + secondary button "Add" + "Not now". Never on the first page view. Remember dismissal for 30 days (localStorage, try/catch) |
| Offline page | `/offline`: card with "You're offline. Teacher pages you opened recently are still available." + list of cached listing names. Service worker caches the shell, `/offline`, and the last 10 listing pages visited (network-first, cache fallback) |
| Standalone mode | In `display-mode: standalone`, the header shows a back chevron on inner pages because there's no browser back button |
| Open Graph image | 1200×630 generated per listing: white background, `tint` left stripe, logo top-left, name 64px/800 `ink`, subjects as `tint` tags, fee and area in `ink-2`. Used for WhatsApp link previews |

## 10. Accessibility
- All text pairs in §3 meet WCAG AA.
- Focus ring on every interactive element: 2px `blue-600` outline + 2px offset (in addition to the input halo).
- Every input has a `<label>`; groups of options use `<fieldset>` + `<legend>`.
- Step bar: `<ol>` with `aria-current="step"` on the current step.
- Errors linked to fields with `aria-describedby`; on submit failure, focus moves to the first invalid field.
- Tap targets ≥ 48px for contact buttons and option boxes, ≥ 44px elsewhere.
- `lang="en"`; Punjabi/Hindi names render via Noto fallbacks.

## 11. Don'ts
- No colours outside §3. No purple, teal, green (except WhatsApp), orange or red accents.
- No gradients except: primary button (blue-600 → blue-700), logo mark, page corner glow, navy panel glow.
- No "→" arrows in button labels, no emoji, no exclamation marks.
- No stock photos, illustrations, hero images, testimonial blocks, "500+ teachers" counters, or "How it works 01/02/03" sections.
- No pop-ups or modals on public pages (install prompt is a dismissible bottom card, not a modal).
- No more than one primary button per screen section.
