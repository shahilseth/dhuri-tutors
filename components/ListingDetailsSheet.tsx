import { classesText, feeText, languageLabel, modeLabel } from "@/lib/format";

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold leading-[22px] text-ink">{value}</dd>
    </div>
  );
}

function DetailsCard({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-6">
      <h2 className="text-[15px] font-bold text-ink">{heading}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">{children}</dl>
    </div>
  );
}

/**
 * The two key-value cards from design.md §6 (Listing page): "Fees and classes" and "Where".
 * Shared by the real listing page (`/t/[slug]`) and the /join review preview (P8.5,
 * app_flow.md J4: "the real public listing page as a preview") so the two can never drift
 * apart.
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
  languages,
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
  languages: string[];
}) {
  return (
    <>
      <DetailsCard heading="Fees and classes">
        <Cell
          label="Monthly fee"
          value={
            <>
              <span className="tabular-nums">{feeText(feeMin, feeMax)}</span>
              {feeNote && <span className="block text-[13px] font-normal text-ink-2">{feeNote}</span>}
            </>
          }
        />
        <Cell label="Classes" value={classesText(classes)} />
        {boards.length > 0 && <Cell label="Board" value={boards.join(", ")} />}
        {timings && <Cell label="Timings" value={timings} />}
      </DetailsCard>

      <DetailsCard heading="Where">
        <Cell label="Teaches from" value={areaText} />
        {servesAreasText && <Cell label="Comes to" value={servesAreasText} />}
        <Cell label="Mode" value={`At ${modes.map(modeLabel).join(", ")}`} />
        {languages.length > 0 && <Cell label="Languages" value={languages.map(languageLabel).join(", ")} />}
      </DetailsCard>
    </>
  );
}
