/** design.md §6 "Info box": tint background, bold lead-in, used for reassurance copy like privacy notes. */
export default function InfoBox({ lead, children }: { lead: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-tint-2 bg-tint p-4 text-[14.5px] leading-[1.5] text-ink-2">
      <span className="font-bold text-ink">{lead} </span>
      {children}
    </div>
  );
}
