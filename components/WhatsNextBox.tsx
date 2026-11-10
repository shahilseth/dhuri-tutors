function TickIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-ice"
    >
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

/** design.md §6 "What happens next": a dark navy panel with a decorative corner glow and a tick list. */
export default function WhatsNextBox({ points }: { points: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-navy p-5 text-white md:rounded-xl md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/25 blur-3xl"
      />
      <h2 className="relative text-[20px] font-bold leading-[1.25] md:text-[22px]">What happens next</h2>
      <ul className="relative mt-3 flex flex-col gap-2.5 text-[14.5px] text-[#DCE6F7]">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <TickIcon />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
