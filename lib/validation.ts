/**
 * Listing form validation (tech_spec.md §8). Pure and framework-free so it
 * can run the same on the client's first check and the server's real one
 * (rules.md §4: every write is validated server-side regardless of the client).
 */
import { AREAS, BOARDS, CLASSES, LANGUAGES, MODES, OTHER_AREA, QUALIFICATIONS, SUBJECTS, TIMINGS } from "./config";
import type { JoinDraft, Listing, ListingKind, RequestDraft, TeachingEntry } from "./types";

export type ListingFormInput = {
  kind: string;
  name: string;
  contact_person: string;
  phone: string;
  whatsapp: string;
  teaching_entries: TeachingEntry[];
  boards: string[];
  modes: string[];
  area: string;
  serves_areas: string[];
  address: string;
  fee_min: string;
  fee_max: string;
  fee_note: string;
  timings: string;
  about: string;
  slug: string;
};

export type ListingFormErrors = Partial<Record<keyof ListingFormInput, string>>;

/** Ready for lib/data.ts's createListing/updateListing, minus fields the action layer owns (city, ref_code, published, consent_at). */
export type ValidatedListingFields = {
  kind: ListingKind;
  name: string;
  contact_person: string | null;
  phone: string;
  whatsapp: string | null;
  /** The union of teaching_entries' subjects/classes — schema.md §3's "rewritten on every save" rule. */
  subjects: string[];
  classes: string[];
  teaching_entries: TeachingEntry[];
  boards: string[];
  modes: string[];
  area: string;
  serves_areas: string[];
  address: string | null;
  fee_min: number | null;
  fee_max: number | null;
  fee_note: string | null;
  timings: string | null;
  about: string | null;
  slug: string;
};

export type ValidationResult =
  | { ok: true; value: ValidatedListingFields }
  | { ok: false; errors: ListingFormErrors };

const classValues = new Set(CLASSES.flatMap((g) => g.options.map((o) => o.value)));
const subjectValues = new Set(SUBJECTS.flatMap((g) => g.options.map((o) => o.value)));
const boardValues = new Set(BOARDS);
const modeValues = new Set(MODES);
const areaValues = new Set(AREAS.flatMap((g) => g.options.map((o) => o.value)));
const languageValues = new Set(LANGUAGES);
const qualificationValues = new Set(QUALIFICATIONS.map((o) => o.value));

/** Strips formatting, drops a leading 91 or 0 country/trunk prefix, then checks 10 digits starting 6–9. */
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const PHONE_ERROR = "Phone number must be 10 digits, starting with 6, 7, 8 or 9.";

function trimmedOrNull(value: string, maxLength: number): { value: string | null; tooLong: boolean } {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { value: null, tooLong: false };
  return { value: trimmed, tooLong: trimmed.length > maxLength };
}

function parseFee(raw: string): { value: number | null; invalid: boolean } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { value: null, invalid: false };
  if (!/^\d+$/.test(trimmed)) return { value: null, invalid: true };
  const n = Number(trimmed);
  return n >= 0 && n <= 100_000 ? { value: n, invalid: false } : { value: null, invalid: true };
}

export function validateListingInput(input: ListingFormInput): ValidationResult {
  const errors: ListingFormErrors = {};

  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }

  const kind = input.kind === "teacher" || input.kind === "academy" ? input.kind : null;
  if (!kind) errors.kind = "Choose teacher or academy.";

  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = PHONE_ERROR;

  let whatsapp: string | null = null;
  if (input.whatsapp.trim().length > 0) {
    whatsapp = normalizePhone(input.whatsapp);
    if (!whatsapp) errors.whatsapp = PHONE_ERROR;
  }

  const teachingResult = validateTeachingEntries(input.teaching_entries);
  if (!teachingResult.ok) errors.teaching_entries = teachingResult.error;

  if (input.modes.length === 0) {
    errors.modes = "Choose at least one way of teaching.";
  } else if (!input.modes.every((m) => modeValues.has(m))) {
    errors.modes = "Choose from the list.";
  }

  if (!input.boards.every((b) => boardValues.has(b))) {
    errors.boards = "Choose boards from the list.";
  }

  if (!input.area || !areaValues.has(input.area)) {
    errors.area = "Choose an area from the list.";
  }

  if (!input.serves_areas.every((a) => areaValues.has(a))) {
    errors.serves_areas = "Choose villages from the list.";
  }

  const address = trimmedOrNull(input.address, 120);
  if (address.tooLong) errors.address = "Address must be 120 characters or fewer.";

  const feeMin = parseFee(input.fee_min);
  if (feeMin.invalid) errors.fee_min = "Fee must be a whole number between 0 and 100,000.";

  const feeMax = parseFee(input.fee_max);
  if (feeMax.invalid) errors.fee_max = "Fee must be a whole number between 0 and 100,000.";

  if (!feeMin.invalid && !feeMax.invalid && feeMin.value != null && feeMax.value != null && feeMin.value > feeMax.value) {
    errors.fee_max = "Maximum fee can't be less than the minimum fee.";
  }

  const feeNote = trimmedOrNull(input.fee_note, 80);
  if (feeNote.tooLong) errors.fee_note = "Fee note must be 80 characters or fewer.";

  const timings = trimmedOrNull(input.timings, 120);
  if (timings.tooLong) errors.timings = "Timings must be 120 characters or fewer.";

  const about = trimmedOrNull(input.about, 600);
  if (about.tooLong) errors.about = "About must be 600 characters or fewer.";

  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) {
    errors.slug = "Link must be lowercase letters, numbers and hyphens, 3 to 60 characters.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const teachingEntries = teachingResult.ok ? teachingResult.value : [];
  const { subjects, classes } = teachingEntriesUnion(teachingEntries);

  return {
    ok: true,
    value: {
      kind: kind as ListingKind,
      name,
      contact_person: trimmedOrNull(input.contact_person, 80).value,
      phone: phone as string,
      whatsapp,
      subjects,
      classes,
      teaching_entries: teachingEntries,
      boards: input.boards,
      modes: input.modes,
      area: input.area,
      serves_areas: input.serves_areas,
      address: address.value,
      fee_min: feeMin.value,
      fee_max: feeMax.value,
      fee_note: feeNote.value,
      timings: timings.value,
      about: about.value,
      slug,
    },
  };
}

export const emptyListingFormInput: ListingFormInput = {
  kind: "teacher",
  name: "",
  contact_person: "",
  phone: "",
  whatsapp: "",
  teaching_entries: [],
  boards: [],
  modes: [],
  area: "",
  serves_areas: [],
  address: "",
  fee_min: "",
  fee_max: "",
  fee_note: "",
  timings: "",
  about: "",
  slug: "",
};

/** Pre-fills ListingForm when editing (app_flow.md A4). `teachingEntries` comes from a separate `teaching_entries` table read. */
export function listingToFormInput(listing: Listing, teachingEntries: TeachingEntry[]): ListingFormInput {
  return {
    kind: listing.kind,
    name: listing.name,
    contact_person: listing.contact_person ?? "",
    phone: listing.phone,
    whatsapp: listing.whatsapp ?? "",
    teaching_entries: teachingEntries,
    boards: listing.boards,
    modes: listing.modes,
    area: listing.area,
    serves_areas: listing.serves_areas ?? [],
    address: listing.address ?? "",
    fee_min: listing.fee_min != null ? String(listing.fee_min) : "",
    fee_max: listing.fee_max != null ? String(listing.fee_max) : "",
    fee_note: listing.fee_note ?? "",
    timings: listing.timings ?? "",
    about: listing.about ?? "",
    slug: listing.slug,
  };
}

/** Parses the hidden JSON input TeachingList serializes its entries into, sanitizing untrusted shapes before validateTeachingEntries runs (rules.md §4). */
function parseTeachingEntriesJson(raw: string): TeachingEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => ({
        track: typeof e.track === "string" ? e.track : "",
        classes: Array.isArray(e.classes) ? e.classes.filter((c): c is string => typeof c === "string") : [],
        subjects: Array.isArray(e.subjects) ? e.subjects.filter((s): s is string => typeof s === "string") : [],
      })) as TeachingEntry[];
  } catch {
    return [];
  }
}

/** Reads a submitted ListingForm into the raw shape validateListingInput expects. */
export function parseListingFormData(formData: FormData): ListingFormInput {
  const str = (name: string) => (formData.get(name)?.toString() ?? "").trim();
  return {
    kind: str("kind"),
    name: str("name"),
    contact_person: str("contact_person"),
    phone: str("phone"),
    whatsapp: str("whatsapp"),
    teaching_entries: parseTeachingEntriesJson(formData.get("teaching_entries")?.toString() ?? "[]"),
    boards: formData.getAll("boards").map(String),
    modes: formData.getAll("modes").map(String),
    area: str("area"),
    serves_areas: formData.getAll("serves_areas").map(String),
    address: str("address"),
    fee_min: str("fee_min"),
    fee_max: str("fee_max"),
    fee_note: str("fee_note"),
    timings: str("timings"),
    about: str("about"),
    slug: str("slug"),
  };
}

/**
 * /request form input (app_flow.md R1–R3, Phase 7). One validator for the whole form —
 * the only server write is at R4 Send (schema.md §4.7); earlier steps call this too, for
 * the parent's immediate feedback, before the draft is allowed to advance.
 */
export type RequestFormInput = {
  class: string;
  subjects: string[];
  all_subjects: string; // checkbox: "yes" or ""
  board: string;
  mode: string;
  area: string;
  area_other: string;
  timings: string[];
  budget_min: string;
  budget_max: string;
  is_adult: string; // "yes" or "no"
  name: string; // the adult being contacted: the requester, or their parent
  student_name: string; // only when is_adult is "no"
  phone: string;
  notes: string;
  consent: string; // checkbox: "yes" or ""
};

export type RequestFormErrors = Partial<Record<keyof RequestFormInput, string>>;

export type ValidatedRequestFields = {
  is_adult: boolean;
  name: string;
  student_name: string | null;
  phone: string;
  class: string | null;
  subjects: string[];
  all_subjects: boolean;
  board: string | null;
  mode: string | null;
  area: string | null;
  area_other: string | null;
  timings: string[];
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
};

export type RequestValidationResult =
  | { ok: true; value: ValidatedRequestFields }
  | { ok: false; errors: RequestFormErrors };

const timingValues = new Set(TIMINGS);

export function validateRequestInput(input: RequestFormInput): RequestValidationResult {
  const errors: RequestFormErrors = {};

  const classValue = input.class.trim();
  if (!classValue || !classValues.has(classValue)) {
    errors.class = "Choose a class from the list.";
  }

  const allSubjects = input.all_subjects === "yes";
  if (!allSubjects) {
    if (input.subjects.length === 0) {
      errors.subjects = "Choose at least one subject, or 'All subjects for this class'.";
    } else if (!input.subjects.every((s) => subjectValues.has(s))) {
      errors.subjects = "Choose subjects from the list.";
    }
  }

  const board = trimmedOrNull(input.board, 40).value;
  if (board && !boardValues.has(board)) errors.board = "Choose a board from the list.";

  if (!input.mode || !modeValues.has(input.mode)) {
    errors.mode = "Choose how you'd like tuition.";
  }

  const isOtherArea = input.area === OTHER_AREA.value;
  let areaOther: string | null = null;
  if (isOtherArea) {
    const other = trimmedOrNull(input.area_other, 80);
    if (!other.value) errors.area_other = "Type the village name.";
    else if (other.tooLong) errors.area_other = "Village name must be 80 characters or fewer.";
    areaOther = other.value;
  } else if (!input.area || !areaValues.has(input.area)) {
    errors.area = "Choose an area from the list.";
  }

  if (input.timings.length === 0) {
    errors.timings = "Choose at least one timing.";
  } else if (!input.timings.every((t) => timingValues.has(t))) {
    errors.timings = "Choose timings from the list.";
  }

  const budgetMin = parseFee(input.budget_min);
  if (budgetMin.invalid) errors.budget_min = "Budget must be a whole number between 0 and 100,000.";

  const budgetMax = parseFee(input.budget_max);
  if (budgetMax.invalid) errors.budget_max = "Budget must be a whole number between 0 and 100,000.";

  if (
    !budgetMin.invalid &&
    !budgetMax.invalid &&
    budgetMin.value != null &&
    budgetMax.value != null &&
    budgetMin.value > budgetMax.value
  ) {
    errors.budget_max = "Maximum budget can't be less than the minimum budget.";
  }

  const isAdult = input.is_adult === "yes" ? true : input.is_adult === "no" ? false : null;
  if (isAdult === null) errors.is_adult = "Tell us if you're 18 or older.";

  const name = trimmedOrNull(input.name, 80);
  if (!name.value) errors.name = isAdult === false ? "Enter your parent's name." : "Enter your name.";
  else if (name.tooLong) errors.name = "Name must be 80 characters or fewer.";

  let studentName: string | null = null;
  if (isAdult === false) {
    const student = trimmedOrNull(input.student_name, 50);
    if (!student.value) errors.student_name = "Enter the student's first name.";
    else if (student.tooLong) errors.student_name = "Student's first name must be 50 characters or fewer.";
    studentName = student.value;
  }

  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = PHONE_ERROR;

  const notes = trimmedOrNull(input.notes, 300);
  if (notes.tooLong) errors.notes = "Notes must be 300 characters or fewer.";

  if (input.consent !== "yes") {
    errors.consent = "Please agree to share this request with matching teachers.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      is_adult: isAdult as boolean,
      name: name.value as string,
      student_name: studentName,
      phone: phone as string,
      class: classValue || null,
      subjects: allSubjects ? [] : input.subjects,
      all_subjects: allSubjects,
      board,
      mode: input.mode,
      area: isOtherArea ? null : input.area,
      area_other: areaOther,
      timings: input.timings,
      budget_min: budgetMin.value,
      budget_max: budgetMax.value,
      notes: notes.value,
    },
  };
}

/** Reads the client-side /request draft (lib/types.ts) into validateRequestInput's input shape (R4 Send, Phase 7). */
export function requestDraftToFormInput(draft: RequestDraft): RequestFormInput {
  return {
    class: draft.class,
    subjects: draft.subjects,
    all_subjects: draft.all_subjects ? "yes" : "",
    board: draft.board,
    mode: draft.mode,
    area: draft.area,
    area_other: draft.area_other,
    timings: draft.timings,
    budget_min: draft.budget_min,
    budget_max: draft.budget_max,
    is_adult: draft.is_adult,
    name: draft.name,
    student_name: draft.student_name,
    phone: draft.phone,
    notes: draft.notes,
    consent: draft.consent ? "yes" : "",
  };
}

export const emptyRequestFormInput: RequestFormInput = {
  class: "",
  subjects: [],
  all_subjects: "",
  board: "",
  mode: "",
  area: "",
  area_other: "",
  timings: [],
  budget_min: "",
  budget_max: "",
  is_adult: "",
  name: "",
  student_name: "",
  phone: "",
  notes: "",
  consent: "",
};

/**
 * Shared by /join (P8.6) and the admin listing form (P8.8) — both build a listing from a
 * `TeachingEntry[]` via components/TeachingList.tsx (app_flow.md J2, schema.md §3). "College"
 * classes aren't reachable here: `teaching_entries.track` is constrained to school/exam/skill
 * (migration 0002), owner-confirmed 2026-11-10.
 */
export function validateTeachingEntries(
  entries: TeachingEntry[],
): { ok: true; value: TeachingEntry[] } | { ok: false; error: string } {
  if (entries.length === 0) return { ok: false, error: "Add at least one thing you teach." };

  for (const entry of entries) {
    if (entry.subjects.length === 0 || !entry.subjects.every((s) => subjectValues.has(s))) {
      return { ok: false, error: "Each teaching list entry needs at least one subject from the list." };
    }

    if (entry.track === "skill") {
      if (entry.classes.length > 0) return { ok: false, error: "A skills entry doesn't take a class." };
    } else if (entry.track === "exam") {
      if (entry.classes.length === 0 || !entry.classes.every((c) => classValues.has(c))) {
        return { ok: false, error: "Each exam entry needs at least one exam from the list." };
      }
    } else if (entry.track === "school") {
      if (entry.classes.length === 0 || !entry.classes.every((c) => classValues.has(c))) {
        return { ok: false, error: "Each school entry needs at least one class from the list." };
      }
    } else {
      return { ok: false, error: "Each teaching list entry needs a valid track." };
    }
  }

  return { ok: true, value: entries };
}

/** listings.subjects/classes stay the union of all a listing's teaching_entries (schema.md §3). */
export function teachingEntriesUnion(entries: TeachingEntry[]): { subjects: string[]; classes: string[] } {
  return {
    subjects: Array.from(new Set(entries.flatMap((e) => e.subjects))),
    classes: Array.from(new Set(entries.flatMap((e) => e.classes))),
  };
}

/**
 * /join form input (app_flow.md J1–J4, Phase 8). One validator for the whole form — the
 * only server write is at J5 Send (schema.md §4.8), same pattern as /request's R4.
 */
export type JoinFormInput = {
  kind: string;
  name: string;
  academy_name: string;
  phone: string;
  whatsapp: string;
  area: string;
  area_other: string;
  address: string;
  teaching_entries: TeachingEntry[];
  boards: string[];
  modes: string[];
  serves_areas: string[];
  experience_years: string;
  qualification_level: string;
  qualification: string;
  languages: string[];
  fee_min: string;
  fee_max: string;
  fee_note: string;
  timings: string;
  headline: string;
  about: string;
  consent: string; // checkbox: "yes" or ""
};

export type JoinFormErrors = Partial<Record<keyof JoinFormInput, string>>;

/** Ready for lib/data.ts's createSignup, minus fields the action layer owns (city, slug, ref_code, published, consent_at, source). */
export type ValidatedJoinFields = {
  kind: ListingKind;
  name: string;
  contact_person: string | null;
  phone: string;
  whatsapp: string | null;
  area: string;
  area_other: string | null;
  address: string | null;
  teaching_entries: TeachingEntry[];
  boards: string[];
  modes: string[];
  serves_areas: string[];
  experience_years: number;
  qualification_level: string;
  qualification: string | null;
  languages: string[];
  fee_min: number | null;
  fee_max: number | null;
  fee_note: string | null;
  timings: string | null;
  headline: string | null;
  about: string;
};

export type JoinValidationResult =
  | { ok: true; value: ValidatedJoinFields }
  | { ok: false; errors: JoinFormErrors };

export function validateJoinInput(input: JoinFormInput): JoinValidationResult {
  const errors: JoinFormErrors = {};

  const kind = input.kind === "teacher" || input.kind === "academy" ? input.kind : null;
  if (!kind) errors.kind = "Choose teacher or academy.";

  const name = trimmedOrNull(input.name, 100);
  if (!name.value) errors.name = "Enter your full name.";
  else if (name.tooLong) errors.name = "Name must be 100 characters or fewer.";

  let academyName: string | null = null;
  if (kind === "academy") {
    const a = trimmedOrNull(input.academy_name, 100);
    if (!a.value) errors.academy_name = "Enter the academy's name.";
    academyName = a.value;
  }

  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = PHONE_ERROR;

  let whatsapp: string | null = null;
  if (input.whatsapp.trim().length > 0) {
    whatsapp = normalizePhone(input.whatsapp);
    if (!whatsapp) errors.whatsapp = PHONE_ERROR;
  }

  // listings.area is not nullable (unlike requests.area): when "Other village" is picked,
  // the "other" sentinel itself is stored in area, with the real name in area_other.
  const isOtherArea = input.area === OTHER_AREA.value;
  let areaOther: string | null = null;
  if (isOtherArea) {
    const other = trimmedOrNull(input.area_other, 80);
    if (!other.value) errors.area_other = "Type the village name.";
    else if (other.tooLong) errors.area_other = "Village name must be 80 characters or fewer.";
    areaOther = other.value;
  } else if (!input.area || !areaValues.has(input.area)) {
    errors.area = "Choose an area from the list.";
  }

  const address = trimmedOrNull(input.address, 120);
  if (address.tooLong) errors.address = "Address must be 120 characters or fewer.";

  const teachingResult = validateTeachingEntries(input.teaching_entries);
  if (!teachingResult.ok) errors.teaching_entries = teachingResult.error;

  if (!input.boards.every((b) => boardValues.has(b))) errors.boards = "Choose boards from the list.";

  if (input.modes.length === 0) errors.modes = "Choose how you teach.";
  else if (!input.modes.every((m) => modeValues.has(m))) errors.modes = "Choose from the list.";

  if (!input.serves_areas.every((a) => areaValues.has(a))) errors.serves_areas = "Choose villages from the list.";

  const yearsRaw = input.experience_years.trim();
  const years = Number(yearsRaw);
  if (!yearsRaw || !Number.isInteger(years) || years < 0 || years > 60) {
    errors.experience_years = "Enter years of teaching experience (0 to 60).";
  }

  if (!input.qualification_level || !qualificationValues.has(input.qualification_level)) {
    errors.qualification_level = "Choose your highest qualification.";
  }

  const qualification = trimmedOrNull(input.qualification, 140).value;

  if (input.languages.length === 0) errors.languages = "Choose at least one teaching language.";
  else if (!input.languages.every((l) => languageValues.has(l))) errors.languages = "Choose from the list.";

  const feeMin = parseFee(input.fee_min);
  if (feeMin.invalid) errors.fee_min = "Fee must be a whole number between 0 and 100,000.";

  const feeMax = parseFee(input.fee_max);
  if (feeMax.invalid) errors.fee_max = "Fee must be a whole number between 0 and 100,000.";

  if (!feeMin.invalid && !feeMax.invalid) {
    if ((feeMin.value == null) !== (feeMax.value == null)) {
      errors.fee_max = "Enter both a minimum and a maximum fee, or leave both blank.";
    } else if (feeMin.value != null && feeMax.value != null && feeMin.value > feeMax.value) {
      errors.fee_max = "Maximum fee can't be less than the minimum fee.";
    }
  }

  const feeNote = trimmedOrNull(input.fee_note, 80);
  if (feeNote.tooLong) errors.fee_note = "Fee note must be 80 characters or fewer.";

  const timings = trimmedOrNull(input.timings, 120);
  if (timings.tooLong) errors.timings = "Timings must be 120 characters or fewer.";

  const headline = trimmedOrNull(input.headline, 80);
  if (headline.tooLong) errors.headline = "Headline must be 80 characters or fewer.";

  const about = trimmedOrNull(input.about, 600);
  if (!about.value) errors.about = "Tell parents a little about yourself.";
  else if (about.tooLong) errors.about = "About must be 600 characters or fewer.";

  if (input.consent !== "yes") errors.consent = "Please agree to be listed before continuing.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      kind: kind as ListingKind,
      name: kind === "academy" ? (academyName as string) : (name.value as string),
      contact_person: kind === "academy" ? (name.value as string) : null,
      phone: phone as string,
      whatsapp,
      area: input.area,
      area_other: areaOther,
      address: address.value,
      teaching_entries: teachingResult.ok ? teachingResult.value : [],
      boards: input.boards,
      modes: input.modes,
      serves_areas: input.serves_areas,
      experience_years: years,
      qualification_level: input.qualification_level,
      qualification,
      languages: input.languages,
      fee_min: feeMin.value,
      fee_max: feeMax.value,
      fee_note: feeNote.value,
      timings: timings.value,
      headline: headline.value,
      about: about.value as string,
    },
  };
}

/** Reads the client-side /join draft (lib/types.ts) into validateJoinInput's input shape (J5 Send, Phase 8). */
export function joinDraftToFormInput(draft: JoinDraft): JoinFormInput {
  return {
    kind: draft.kind,
    name: draft.name,
    academy_name: draft.academy_name,
    phone: draft.phone,
    whatsapp: draft.whatsapp,
    area: draft.area,
    area_other: draft.area_other,
    address: draft.address,
    teaching_entries: draft.teaching_entries,
    boards: draft.boards,
    modes: draft.modes,
    serves_areas: draft.serves_areas,
    experience_years: draft.experience_years,
    qualification_level: draft.qualification_level,
    qualification: draft.qualification,
    languages: draft.languages,
    fee_min: draft.fee_min,
    fee_max: draft.fee_max,
    fee_note: draft.fee_note,
    timings: draft.timings,
    headline: draft.headline,
    about: draft.about,
    consent: draft.consent ? "yes" : "",
  };
}
