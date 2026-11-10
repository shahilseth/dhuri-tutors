import { classesText, feeText, modeLabel } from "@/lib/format";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <dt className="w-24 shrink-0 text-[15px] text-ink-2">{label}</dt>
      <dd className="text-[16px] leading-[24px] text-ink">{value}</dd>
    </div>
  );
}

/**
 * The ruled "exercise book" details sheet from design.md §6 (Listing page): red margin
 * line, Classes/Board/Fees/Timings/Mode/Area/Comes to rows. Shared by the real listing page
 * (`/t/[slug]`) and the /join review preview (P8.5, app_flow.md J4: "the real public
 * listing page as a preview") so the two can never drift apart.
 */
export default function ListingDetailsSheet({
  classes,
  boards,
  feeMin,
  feeMax,
  feeNote,
  timings,
  modes,
  areaText,
  servesAreasText,
}: {
  classes: string[];
  boards: string[];
  feeMin: number | null;
  feeMax: number | null;
  feeNote: string | null;
  timings: string | null;
  modes: string[];
  areaText: string;
  servesAreasText: string | null;
}) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-r-md border border-rule bg-paper">
      <div className="absolute inset-y-0 left-0 w-[2px] bg-margin" />
      <dl className="divide-y divide-rule">
        <Row label="Classes" value={classesText(classes)} />
        {boards.length > 0 && <Row label="Board" value={boards.join(", ")} />}
        <Row
          label="Fees"
          value={
            <>
              <span className="tabular-nums">{feeText(feeMin, feeMax)}</span>
              {feeNote && <span className="block text-[15px] text-ink-2">{feeNote}</span>}
            </>
          }
        />
        {timings && <Row label="Timings" value={timings} />}
        <Row label="Mode" value={`At ${modes.map(modeLabel).join(", ")}`} />
        <Row label="Area" value={areaText} />
        {servesAreasText && <Row label="Comes to" value={servesAreasText} />}
      </dl>
    </div>
  );
}
