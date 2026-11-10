/** design.md §6 "Trust notes row": centered, wraps on mobile, each item prefixed with a blue-600 check. */
export default function TrustNotes({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[13.5px] text-ink-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <span className="text-blue-600">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
