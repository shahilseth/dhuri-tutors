import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { AREAS, CITY, CLASSES, MODES, SUBJECTS } from "@/lib/config";
import { searchListings } from "@/lib/data";
import { modeLabel } from "@/lib/format";
import type { SearchFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

const SUBJECT_VALUES = new Set(SUBJECTS.flatMap((g) => g.options.map((o) => o.value)));
const CLASS_VALUES = new Set(CLASSES.flatMap((g) => g.options.map((o) => o.value)));

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
    area: area && AREAS.includes(area) ? area : undefined,
    mode: mode && MODES.includes(mode) ? mode : undefined,
    q: q || undefined,
  };
}

const selectClass =
  "mt-1 block h-12 w-full rounded-md border border-rule bg-paper px-3 text-[16px] text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/25";

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
      <span className="text-[15px] font-medium text-ink">{label}</span>
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
    <div className="mx-auto max-w-[42rem] px-4 py-6">
      <h1 className="text-[22px] leading-[28px] font-bold text-ink">
        Tuition teachers in {CITY}
      </h1>
      <p className="mt-2 text-[15px] leading-[22px] text-ink-2">
        Search by subject, class and area. Call or WhatsApp the teacher
        directly.
      </p>

      <form method="get" className="mt-6 rounded-md border border-rule bg-paper p-4">
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
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
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
          className="mt-4 h-12 w-full rounded-md bg-blue text-[16px] font-semibold text-white"
        >
          Search
        </button>

        {hasFilters && (
          <Link
            href="/"
            className="mt-3 block text-center text-[15px] text-blue underline"
          >
            Clear filters
          </Link>
        )}
      </form>

      <p className="mt-6 text-[15px] text-ink-2">
        {listings.length} {listings.length === 1 ? "teacher" : "teachers"} found
      </p>

      <div className="mt-2 rounded-md border border-rule bg-paper">
        {listings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[15px] text-ink-2">No teachers match these filters yet.</p>
            <Link href="/" className="mt-2 inline-block text-[15px] text-blue underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-rule">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
