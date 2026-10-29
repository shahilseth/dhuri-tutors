import Link from "next/link";
import type { Listing } from "@/lib/types";
import { classesText, feeText, modeLabel, subjectLabel } from "@/lib/format";

const KIND_LABELS: Record<Listing["kind"], string> = {
  teacher: "Teacher",
  academy: "Academy",
};

/** One row in the result list on the home page (design.md §6 "Result list"). */
export default function ListingCard({ listing }: { listing: Listing }) {
  const fee = feeText(listing.fee_min, listing.fee_max);
  const classes = classesText(listing.classes);
  const modes = listing.modes.map(modeLabel).join(", ");

  return (
    <Link
      href={`/t/${listing.slug}`}
      className="block px-4 py-3 active:bg-blue-tint"
    >
      <p className="text-[17px] leading-[24px] font-semibold text-ink">{listing.name}</p>
      <p className="mt-0.5 text-[15px] leading-[22px] text-ink-2">
        {KIND_LABELS[listing.kind]}, {listing.area}
      </p>
      <p className="mt-0.5 text-[16px] leading-[24px] tabular-nums">
        {fee === "Fee on request" ? (
          <span className="text-[15px] text-ink-3">{fee}</span>
        ) : (
          <>
            <span className="font-semibold text-ink">{fee.replace(" a month", "")}</span>{" "}
            <span className="text-[15px] font-normal text-ink-2">a month</span>
          </>
        )}
      </p>
      {listing.subjects.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {listing.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-sm bg-blue-tint px-2 py-0.5 text-[13px] font-medium text-blue"
            >
              {subjectLabel(subject)}
            </span>
          ))}
        </p>
      )}
      {(classes || modes) && (
        <p className="mt-2 text-[15px] leading-[22px] text-ink-2">
          {classes}
          {classes && modes ? ". " : ""}
          {modes ? `At ${modes}` : ""}
        </p>
      )}
    </Link>
  );
}
