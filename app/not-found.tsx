import Link from "next/link";

/** S3 in app_flow.md: any unknown or unpublished slug lands here. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[42rem] px-4 py-16 text-center">
      <p className="text-[16px] leading-[24px] text-ink">
        This page isn&apos;t available. The teacher may no longer be listed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-blue px-6 text-[16px] font-semibold text-white"
      >
        See all teachers
      </Link>
    </div>
  );
}
