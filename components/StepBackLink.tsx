import Link from "next/link";

/** design.md §11: "Back" is a text link, top-left of the step. */
export default function StepBackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-block text-[15px] text-blue underline">
      Back
    </Link>
  );
}
