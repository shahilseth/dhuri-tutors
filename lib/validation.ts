/**
 * Listing form validation (tech_spec.md §8). Pure and framework-free so it
 * can run the same on the client's first check and the server's real one
 * (rules.md §4: every write is validated server-side regardless of the client).
 */
import { AREAS, BOARDS, CLASSES, MODES, OTHER_AREA, SUBJECTS, TIMINGS } from "./config";
import type { Listing, ListingKind } from "./types";

export type ListingFormInput = {
  kind: string;
  name: string;
  contact_person: string;
  phone: string;
  whatsapp: string;
  subjects: string[];
  classes: string[];
  boards: string[];
  modes: string[];
  area: string;
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
  subjects: string[];
  classes: string[];
  boards: string[];
  modes: string[];
  area: string;
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

  if (input.subjects.length === 0) {
    errors.subjects = "Choose at least one subject.";
  } else if (!input.subjects.every((s) => subjectValues.has(s))) {
    errors.subjects = "Choose subjects from the list.";
  }

  if (input.classes.length === 0) {
    errors.classes = "Choose at least one class.";
  } else if (!input.classes.every((c) => classValues.has(c))) {
    errors.classes = "Choose classes from the list.";
  }

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

  return {
    ok: true,
    value: {
      kind: kind as ListingKind,
      name,
      contact_person: trimmedOrNull(input.contact_person, 80).value,
      phone: phone as string,
      whatsapp,
      subjects: input.subjects,
      classes: input.classes,
      boards: input.boards,
      modes: input.modes,
      area: input.area,
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
  subjects: [],
  classes: [],
  boards: [],
  modes: [],
  area: "",
  address: "",
  fee_min: "",
  fee_max: "",
  fee_note: "",
  timings: "",
  about: "",
  slug: "",
};

/** Pre-fills ListingForm when editing (app_flow.md A4). */
export function listingToFormInput(listing: Listing): ListingFormInput {
  return {
    kind: listing.kind,
    name: listing.name,
    contact_person: listing.contact_person ?? "",
    phone: listing.phone,
    whatsapp: listing.whatsapp ?? "",
    subjects: listing.subjects,
    classes: listing.classes,
    boards: listing.boards,
    modes: listing.modes,
    area: listing.area,
    address: listing.address ?? "",
    fee_min: listing.fee_min != null ? String(listing.fee_min) : "",
    fee_max: listing.fee_max != null ? String(listing.fee_max) : "",
    fee_note: listing.fee_note ?? "",
    timings: listing.timings ?? "",
    about: listing.about ?? "",
    slug: listing.slug,
  };
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
    subjects: formData.getAll("subjects").map(String),
    classes: formData.getAll("classes").map(String),
    boards: formData.getAll("boards").map(String),
    modes: formData.getAll("modes").map(String),
    area: str("area"),
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
