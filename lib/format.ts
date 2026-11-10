/** Turns raw listing data into the plain-English text design.md specifies. */
import { APP_NAME, AREAS, CLASSES, QUALIFICATIONS, STALE_AFTER_DAYS, SUBJECTS } from "./config";

function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** "₹800 to ₹1,500 a month", "₹800 a month" or "Fee on request" (design.md §4). */
export function feeText(feeMin: number | null, feeMax: number | null): string {
  if (feeMin == null && feeMax == null) return "Fee on request";
  if (feeMin != null && feeMax != null) return `${rupees(feeMin)} to ${rupees(feeMax)} a month`;
  return `${rupees((feeMin ?? feeMax) as number)} a month`;
}

function classLabel(value: string): string {
  for (const group of CLASSES) {
    const option = group.options.find((o) => o.value === value);
    if (option) return option.label;
  }
  return value;
}

/** Display label for a stored subject value, e.g. "maths" -> "Maths". */
export function subjectLabel(value: string): string {
  for (const group of SUBJECTS) {
    const option = group.options.find((o) => o.value === value);
    if (option) return option.label;
  }
  return value;
}

/** "Class 9 to 12" for a continuous run, "Class 6, 8, 10" otherwise (design.md §4). */
export function classesText(classes: string[]): string {
  if (classes.length === 0) return "";

  const numbers = classes.filter((c) => /^\d+$/.test(c)).map(Number);
  if (numbers.length !== classes.length) {
    // Mixed with, or entirely, non-numeric classes (exam/college codes): list their labels as-is.
    return classes.map(classLabel).join(", ");
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const runs: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    runs.push(start === prev ? `${start}` : `${start} to ${prev}`);
    start = n;
    prev = n;
  }

  return `Class ${runs.join(", ")}`;
}

const MODE_LABELS: Record<string, string> = {
  academy: "academy",
  home: "home tuition",
  online: "online",
};

export function modeLabel(mode: string): string {
  return MODE_LABELS[mode] ?? mode;
}

const TIMING_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  weekends: "Weekends",
};

export function timingLabel(timing: string): string {
  return TIMING_LABELS[timing] ?? timing;
}

const LANGUAGE_LABELS: Record<string, string> = {
  punjabi: "Punjabi",
  hindi: "Hindi",
  english: "English",
};

export function languageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language;
}

/** Display label for a stored qualification_level value, e.g. "postgraduate" -> "Postgraduate". */
export function qualificationLabel(value: string): string {
  return QUALIFICATIONS.find((o) => o.value === value)?.label ?? value;
}

/** Whole days elapsed. Used directly for the admin dashboard's "Not confirmed for N days" (design.md §7). */
export function daysSince(date: string | Date): number {
  const then = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - then.getTime()) / 86_400_000);
}

/** "today", "1 day ago", "3 days ago", "2 months ago", "1 year ago". */
export function ago(date: string | Date): string {
  const days = daysSince(date);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.round(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.round(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/** Never verified, or not verified within STALE_AFTER_DAYS (admin dashboard flag). */
export function isStale(lastVerifiedAt: string | null): boolean {
  if (lastVerifiedAt === null) return true;
  return daysSince(lastVerifiedAt) > STALE_AFTER_DAYS;
}

/** A validated 10-digit phone to international form for wa.me / tel: links, e.g. "919988776655". */
export function intl(phone: string): string {
  return `91${phone.replace(/\D/g, "")}`;
}

/**
 * Quick client-side phone check for the multi-step forms (design.md §11: client checks are
 * for convenience only — lib/validation.ts's normalizePhone is the real, server-side check).
 */
export function looksLikePhone(value: string): boolean {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits);
}

export function whatsappMessage(refCode: string): string {
  return `Hi, I found you on ${APP_NAME} (ref ${refCode}). Is this still open for new students?`;
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${intl(phone)}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string): string {
  return `tel:+${intl(phone)}`;
}

/** Share-to-any-chat link (tech_spec.md §3.3): no phone number, opens WhatsApp's chat picker. */
export function shareUrl(name: string, listingUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${name} - ${listingUrl}`)}`;
}

/** wa.me link for an already-international number, e.g. ADMIN_WHATSAPP ("91XXXXXXXXXX") — unlike intl(), doesn't add a "91" prefix. */
export function waUrlForNumber(internationalPhone: string, message: string): string {
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

/** Display label for a stored area value, or the free-text village name when "Other village" was picked. */
export function areaLabel(area: string | null, areaOther: string | null): string {
  if (areaOther) return areaOther;
  if (!area) return "";
  for (const group of AREAS) {
    const option = group.options.find((o) => o.value === area);
    if (option) return option.label;
  }
  return area;
}

/** One-line recap of a /request's "What" + "Where" fields — the "key details" in R4's WhatsApp message (app_flow.md R4). */
export function requestSummary(input: {
  classValue: string | null;
  subjects: string[];
  allSubjects: boolean;
  mode: string | null;
  area: string | null;
  areaOther: string | null;
}): string {
  const classText = input.classValue ? classesText([input.classValue]) : "any class";
  const subjectText = input.allSubjects
    ? "all subjects"
    : input.subjects.map(subjectLabel).join(", ") || "no subject chosen";
  const modeText = input.mode ? modeLabel(input.mode) : "any mode";
  const areaText = areaLabel(input.area, input.areaOther) || "any area";
  return `${classText}, ${subjectText}, ${modeText}, ${areaText}`;
}

/** The admin's WhatsApp message for a new /request (design.md §11: "reference code and key details"). */
export function requestWhatsappMessage(refCode: string, summary: string): string {
  return `New request on ${APP_NAME} (ref ${refCode}): ${summary}`;
}

/** The admin's WhatsApp message for a new /join sign-up (design.md §11: "reference code and key details"). */
export function signupWhatsappMessage(refCode: string, name: string): string {
  return `New sign-up on ${APP_NAME} (ref ${refCode}): ${name}`;
}

/**
 * /admin/requests "Send to teacher" message (app_flow.md A5). `phone` is only included when
 * the admin has ticked "Parent agreed to share number" for this request (migration 0003) —
 * pass `null` otherwise, and the parent's name is sent on its own with no number.
 */
export function requestOutreachMessage(
  refCode: string,
  summary: string,
  contactName: string,
  phone: string | null,
): string {
  const contact = phone ? `${contactName}, ${phone}` : contactName;
  return `Hi, a parent is looking for ${summary} (ref ${refCode}). Contact: ${contact}.`;
}

/** Lowercase, hyphenated slug candidate from a name. Uniqueness suffixes are added by the caller. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
