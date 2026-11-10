import { classesText, feeText, modeLabel } from "@/lib/format";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2.5">
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="text-[15px] font-semibold leading-[22px] text-ink">{value}</dd>
    </div>
  );
}

/**
 * The 2-column key-value details card from design.md §6 (Listing page): Classes/Board/Fees/
 * Timings/Mode/Area/Comes to rows. Shared by the real listing page (`/t/[slug]`) and the
 * /join review preview (P8.5, app_flow.md J4: "the real public listing page as a preview")
 * so the two can never drift apart.
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
    <div className="mt-4 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-6">
      <dl className="divide-y divide-line">
        <Row label="Classes" value={classesText(classes)} />
        {boards.length > 0 && <Row label="Board" value={boards.join(", ")} />}
        <Row
          label="Fees"
          value={
            <>
              <span className="tabular-nums">{feeText(feeMin, feeMax)}</span>
              {feeNote && <span className="block text-[14.5px] font-normal text-ink-2">{feeNote}</span>}
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
