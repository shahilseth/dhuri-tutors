/**
 * Single source of truth for app identity and the allowed values behind every
 * filter, checkbox and dropdown. Search params and form submissions are
 * checked against these lists; unknown values are ignored (rules.md §3).
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Dhuri Tutors";
export const CITY = process.env.NEXT_PUBLIC_CITY ?? "Dhuri";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** A listing not re-confirmed within this many days is flagged in the admin dashboard. */
export const STALE_AFTER_DAYS = 60;

export type ConfigOption = {
  /** Stored in the database. Stable — never rename once data exists. */
  value: string;
  /** Shown to users. Safe to change anytime. */
  label: string;
};

export type ConfigGroup = {
  group: string;
  options: ConfigOption[];
};

/** Classes a listing can teach. Grouped for <optgroup>; each class is its own value. */
export const CLASSES: ConfigGroup[] = [
  {
    group: "School",
    options: [
      { value: "nursery", label: "Nursery" },
      { value: "lkg", label: "LKG" },
      { value: "ukg", label: "UKG" },
      { value: "1", label: "Class 1" },
      { value: "2", label: "Class 2" },
      { value: "3", label: "Class 3" },
      { value: "4", label: "Class 4" },
      { value: "5", label: "Class 5" },
      { value: "6", label: "Class 6" },
      { value: "7", label: "Class 7" },
      { value: "8", label: "Class 8" },
      { value: "9", label: "Class 9" },
      { value: "10", label: "Class 10" },
      { value: "11", label: "Class 11" },
      { value: "12", label: "Class 12" },
    ],
  },
  {
    group: "Entrance and competitive exams",
    options: [
      { value: "jee", label: "JEE" },
      { value: "neet", label: "NEET" },
      { value: "nda", label: "NDA" },
      { value: "jnv-sainik", label: "Navodaya / Sainik School entrance" },
      { value: "ssc", label: "SSC" },
      { value: "banking", label: "Banking exams" },
      { value: "punjab-govt", label: "Punjab govt exams (Police, PSSSB, Patwari)" },
      { value: "army", label: "Army / Agniveer" },
      { value: "ielts-pte", label: "IELTS / PTE" },
    ],
  },
  {
    group: "College",
    options: [
      { value: "bcom", label: "B.Com" },
      { value: "ba", label: "BA" },
      { value: "bsc", label: "B.Sc" },
      { value: "bca", label: "BCA" },
      { value: "other-college", label: "Other college course" },
    ],
  },
];

/** Subjects a listing can teach. Grouped for <optgroup>. */
export const SUBJECTS: ConfigGroup[] = [
  {
    group: "School subjects",
    options: [
      { value: "all", label: "All subjects" },
      { value: "maths", label: "Maths" },
      { value: "science", label: "Science" },
      { value: "physics", label: "Physics" },
      { value: "chemistry", label: "Chemistry" },
      { value: "biology", label: "Biology" },
      { value: "english", label: "English" },
      { value: "punjabi", label: "Punjabi" },
      { value: "hindi", label: "Hindi" },
      { value: "sanskrit", label: "Sanskrit" },
      { value: "social-science", label: "Social Science" },
      { value: "history", label: "History" },
      { value: "geography", label: "Geography" },
      { value: "political-science", label: "Political Science" },
      { value: "economics", label: "Economics" },
      { value: "accountancy", label: "Accountancy" },
      { value: "business-studies", label: "Business Studies" },
      { value: "computer", label: "Computer Science" },
      { value: "physical-education", label: "Physical Education" },
      { value: "home-science", label: "Home Science" },
    ],
  },
  {
    group: "Skills and extra classes",
    options: [
      { value: "spoken-english", label: "Spoken English" },
      { value: "handwriting", label: "Handwriting" },
      { value: "abacus", label: "Abacus / Vedic Maths" },
      { value: "coding", label: "Coding" },
      { value: "drawing", label: "Drawing / Fine Arts" },
      { value: "music", label: "Music" },
    ],
  },
  {
    group: "Exam preparation",
    options: [
      { value: "reasoning", label: "Reasoning" },
      { value: "quant", label: "Quantitative Aptitude" },
      { value: "gk", label: "General Knowledge / Current Affairs" },
    ],
  },
];

/** Education boards. Flat list — the value is the acronym shown to users. */
export const BOARDS: string[] = ["PSEB", "CBSE", "ICSE"];

/** How a listing teaches. Flat list; display phrasing lives in lib/format.ts. */
export const MODES: string[] = ["academy", "home", "online"];

/** Dhuri town and the nearby villages a listing can be based in. Grouped for <optgroup>. */
export const AREAS: ConfigGroup[] = [
  {
    group: "Dhuri",
    options: [{ value: "dhuri-town", label: "Dhuri town" }],
  },
  {
    group: "Nearby villages",
    options: [
      { value: "badshahpur", label: "Badshahpur" },
      { value: "bamal", label: "Bamal" },
      { value: "banbhauri", label: "Banbhauri" },
      { value: "baradwal", label: "Baradwal" },
      { value: "bhasaur", label: "Bhasaur" },
      { value: "ghanaur-khurd", label: "Ghanaur Khurd" },
      { value: "ghanauri-kalan", label: "Ghanauri Kalan" },
      { value: "jhaloor", label: "Jhaloor" },
      { value: "kaheru", label: "Kaheru" },
      { value: "kumbherwal", label: "Kumbherwal" },
      { value: "mullowal", label: "Mullowal" },
      { value: "rajomajra", label: "Rajomajra" },
      { value: "rangian", label: "Rangian" },
      { value: "sekha", label: "Sekha" },
    ],
  },
];

/**
 * "Other village (type name)", offered alongside the AREAS dropdown in the Phase 7/8
 * forms (`/request`, `/join`). Picking it saves free text to `area_other` instead of
 * `area` (schema.md §3, migration 0002) — not wired into the V0 admin form, which only
 * has the `area` column to write to.
 */
export const OTHER_AREA: ConfigOption = { value: "other", label: "Other village (type name)" };
