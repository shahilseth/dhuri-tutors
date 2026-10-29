/** Turns raw listing data into the plain-English text design.md specifies. */
import { APP_NAME, CLASSES, STALE_AFTER_DAYS, SUBJECTS } from "./config";

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

function daysSince(date: string | Date): number {
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
