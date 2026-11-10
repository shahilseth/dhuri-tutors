import Link from "next/link";
import type { Listing } from "@/lib/types";
import { classesText, feeText, modeLabel, subjectLabel } from "@/lib/format";

const KIND_LABELS: Record<Listing["kind"], string> = {
  teacher: "Teacher",
  academy: "Academy",
};

/** One result card on the home page (design.md §6 "Home and search" item 5). */
export default function ListingCard({ listing }: { listing: Listing }) {
  const fee = feeText(listing.fee_min, listing.fee_max);
  const classes = classesText(listing.classes);
  const modes = listing.modes.map(modeLabel).join(", ");

  return (
    <Link
      href={`/t/${listing.slug}`}
      className="block rounded-lg border border-line bg-white p-4 shadow-card transition-colors active:border-blue-600 md:rounded-xl"
    >
      <p className="text-[17.5px] font-bold leading-[24px] tracking-[-0.01em] text-ink">{listing.name}</p>
      <p className="mt-0.5 text-[14.5px] leading-[22px] text-ink-2">
        {KIND_LABELS[listing.kind]}, {listing.area}
      </p>
      <p className="mt-0.5 text-[16px] leading-[24px] tabular-nums">
        {fee === "Fee on request" ? (
          <span className="text-[15px] text-ink-3">{fee}</span>
        ) : (
          <>
            <span className="font-bold text-ink">{fee.replace(" a month", "")}</span>{" "}
            <span className="text-[14.5px] font-normal text-ink-2">a month</span>
          </>
        )}
      </p>
      {listing.subjects.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {listing.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-sm bg-tint px-2.5 py-1 text-[13px] font-semibold text-blue-700"
            >
              {subjectLabel(subject)}
            </span>
          ))}
        </p>
      )}
      {(classes || modes) && (
        <p className="mt-2 text-[14.5px] leading-[22px] text-ink-2">
          {classes}
          {classes && modes ? ". " : ""}
          {modes ? `At ${modes}` : ""}
        </p>
      )}
    </Link>
  );
}
