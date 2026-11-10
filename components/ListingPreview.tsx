import { CITY } from "@/lib/config";
import { areaLabel, subjectLabel } from "@/lib/format";
import type { JoinDraft, ListingKind } from "@/lib/types";
import { teachingEntriesUnion } from "@/lib/validation";
import ListingDetailsSheet from "./ListingDetailsSheet";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  );
}

const KIND_LABELS: Record<ListingKind, string> = {
  teacher: "Teacher",
  academy: "Academy",
};

/**
 * J4 "Review": "the real public listing page as a preview" (app_flow.md). Renders the same
 * facts the real `/t/[slug]` page will show, from an in-progress JoinDraft instead of a
 * saved Listing — sharing ListingDetailsSheet keeps the two from drifting apart. The
 * WhatsApp/Call buttons are shown but not real links: there's no slug or saved record yet.
 */
export default function ListingPreview({ draft }: { draft: JoinDraft }) {
  const kind: ListingKind = draft.kind === "academy" ? "academy" : "teacher";
  const name = kind === "academy" ? draft.academy_name : draft.name;
  const contactLine = kind === "academy" && draft.name ? `, run by ${draft.name}` : "";
  const { subjects, classes } = teachingEntriesUnion(draft.teaching_entries);
  const area = [draft.address, areaLabel(draft.area, draft.area_other), CITY].filter(Boolean).join(", ");
  const servesAreasText =
    draft.serves_areas.length > 0 ? draft.serves_areas.map((a) => areaLabel(a, null)).join(", ") : null;

  return (
    <div className="rounded-md border border-rule bg-paper p-4">
      <p className="text-[13px] text-ink-3">This is what parents will see.</p>

      <h2 className="mt-2 text-[24px] leading-[30px] font-bold text-ink">{name || "Your name"}</h2>
      <p className="mt-1 text-[15px] leading-[22px] text-ink-2">
        {KIND_LABELS[kind]}
        {contactLine}
      </p>

      {subjects.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {subjects.map((subject) => (
            <span key={subject} className="rounded-sm bg-blue-tint px-2 py-0.5 text-[13px] font-medium text-blue">
              {subjectLabel(subject)}
            </span>
          ))}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3" aria-hidden>
        <span className="flex h-12 cursor-default items-center justify-center rounded-md bg-wa text-[16px] font-semibold text-white opacity-60">
          WhatsApp
        </span>
        <span className="flex h-12 cursor-default items-center justify-center gap-1.5 rounded-md bg-blue text-[16px] font-semibold text-white opacity-60">
          <PhoneIcon />
          Call
        </span>
      </div>

      <ListingDetailsSheet
        classes={classes}
        boards={draft.boards}
        feeMin={draft.fee_min ? Number(draft.fee_min) : null}
        feeMax={draft.fee_max ? Number(draft.fee_max) : null}
        feeNote={draft.fee_note || null}
        timings={draft.timings || null}
        modes={draft.modes}
        areaText={area}
        servesAreasText={servesAreasText}
      />

      {draft.about && (
        <>
          <h3 className="mt-6 text-[17px] leading-[24px] font-semibold text-ink">About</h3>
          <p className="mt-2 max-w-prose text-[16px] leading-[24px] text-ink">{draft.about}</p>
        </>
      )}
    </div>
  );
}
