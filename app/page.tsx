import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { AREAS, CITY, CLASSES, MODES, SUBJECTS } from "@/lib/config";
import { searchListings } from "@/lib/data";
import { modeLabel } from "@/lib/format";
import type { SearchFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

const SUBJECT_VALUES = new Set(SUBJECTS.flatMap((g) => g.options.map((o) => o.value)));
const CLASS_VALUES = new Set(CLASSES.flatMap((g) => g.options.map((o) => o.value)));
const AREA_VALUES = new Set(AREAS.flatMap((g) => g.options.map((o) => o.value)));

function pick(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Keeps only values from lib/config.ts lists; unknown values are ignored (rules.md §3). */
function parseFilters(params: Record<string, string | string[] | undefined>): SearchFilters {
  const subject = pick(params.subject);
  const classParam = pick(params.class);
  const area = pick(params.area);
  const mode = pick(params.mode);
  const q = pick(params.q)?.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  return {
    subject: subject && SUBJECT_VALUES.has(subject) ? subject : undefined,
    class: classParam && CLASS_VALUES.has(classParam) ? classParam : undefined,
    area: area && AREA_VALUES.has(area) ? area : undefined,
    mode: mode && MODES.includes(mode) ? mode : undefined,
    q: q || undefined,
  };
}

const selectClass =
  "mt-1 block h-[54px] w-full rounded-md border-[1.5px] border-line bg-white px-4 text-[16px] text-ink focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[15px] font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const listings = await searchListings(filters);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-[42rem] px-4 py-6 md:px-6">
      <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
        {CITY} and nearby villages
      </p>
      <h1 className="mt-2.5 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
        Find a tuition teacher near you
      </h1>
      <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.55] text-ink-2">
        Search by subject, class and area. Call or WhatsApp the teacher directly.
      </p>

      <form
        method="get"
        className="mt-6 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Subject">
            <select name="subject" defaultValue={filters.subject ?? ""} className={selectClass}>
              <option value="">All subjects</option>
              {SUBJECTS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Class">
            <select name="class" defaultValue={filters.class ?? ""} className={selectClass}>
              <option value="">All classes</option>
              {CLASSES.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Area">
            <select name="area" defaultValue={filters.area ?? ""} className={selectClass}>
              <option value="">All areas</option>
              {AREAS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Mode">
            <select name="mode" defaultValue={filters.mode ?? ""} className={selectClass}>
              <option value="">Any mode</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {modeLabel(mode)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Name" className="mt-4">
          <input
            type="text"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Teacher or academy name"
            className={selectClass}
          />
        </Field>

        <button
          type="submit"
          className="mt-4 h-[54px] w-full rounded-md bg-gradient-to-b from-blue-600 to-blue-700 text-[16px] font-bold text-white shadow-btn active:from-blue-800 active:to-blue-800 active:shadow-none"
        >
          Search
        </button>

        {hasFilters && (
          <Link
            href="/"
            className="mt-3 block text-center text-[15px] font-semibold text-blue-700 underline"
          >
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[15px] text-ink-2">
          {listings.length} {listings.length === 1 ? "teacher" : "teachers"} found
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="mt-2 rounded-lg border border-line bg-white p-6 text-center shadow-card md:rounded-xl">
          <p className="text-[15px] text-ink-2">No teachers match these filters yet.</p>
          <Link href="/" className="mt-2 inline-block text-[15px] font-semibold text-blue-700 underline">
            Clear filters
          </Link>
          <p className="mt-4 text-[15px] text-ink-2">
            <Link href="/request" className="font-semibold text-blue-700 underline">
              Can&apos;t find the right teacher? Tell us what you need
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-col gap-3.5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {listings.length > 0 && (
        <div className="mt-6 rounded-md border border-tint-2 bg-tint p-4">
          <p className="text-[14.5px] leading-[1.5] text-ink-2">
            Can&apos;t find the right teacher? Tell us what you need and we&apos;ll find one.
          </p>
          <Link
            href="/request"
            className="mt-3 flex h-[54px] items-center justify-center rounded-md bg-gradient-to-b from-blue-600 to-blue-700 text-[16px] font-bold text-white shadow-btn"
          >
            Tell us what you need
          </Link>
        </div>
      )}
    </div>
  );
}
