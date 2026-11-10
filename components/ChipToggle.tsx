/** A compact rounded-pill multi-select toggle (design.md §6 "Home and search" subject chips). */
export default function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border-[1.5px] px-3.5 py-2 text-[14px] font-semibold transition-colors ${
        selected ? "border-blue-700 bg-blue-700 text-white" : "border-line bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}
