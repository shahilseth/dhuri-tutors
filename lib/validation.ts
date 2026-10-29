/**
 * Listing form validation (tech_spec.md §8). Pure and framework-free so it
 * can run the same on the client's first check and the server's real one
 * (rules.md §4: every write is validated server-side regardless of the client).
 */
import { AREAS, BOARDS, CLASSES, MODES, SUBJECTS } from "./config";
import type { ListingKind } from "./types";

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
const areaValues = new Set(AREAS);

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
