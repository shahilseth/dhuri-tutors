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
        className="mt-6 inline-flex h-[54px] items-center justify-center rounded-md bg-gradient-to-b from-blue-600 to-blue-700 px-6 text-[16px] font-bold text-white shadow-btn"
      >
        See all teachers
      </Link>
    </div>
  );
}
