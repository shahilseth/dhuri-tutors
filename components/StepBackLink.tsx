import Link from "next/link";

/** design.md §6 "Buttons": "‹ Back" is an ink-2, 600-weight text link, top-left of the step. */
export default function StepBackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-block text-[15px] font-semibold text-ink-2">
      ‹ Back
    </Link>
  );
}
