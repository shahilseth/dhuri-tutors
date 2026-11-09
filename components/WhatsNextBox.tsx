/** design.md §11: plain white box, never a dark panel. */
export default function WhatsNextBox({ points }: { points: string[] }) {
  return (
    <div className="rounded-md border border-rule bg-paper p-4">
      <h2 className="text-[17px] font-semibold text-ink">What happens next</h2>
      <ul className="mt-2 flex flex-col gap-2 text-[15px] text-ink-2">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
