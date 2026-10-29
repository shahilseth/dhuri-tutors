import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME, CITY, SITE_URL } from "@/lib/config";
import { getListingBySlug } from "@/lib/data";
import {
  ago,
  classesText,
  feeText,
  isStale,
  modeLabel,
  subjectLabel,
  telUrl,
  whatsappMessage,
  whatsappUrl,
} from "@/lib/format";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<Listing["kind"], string> = {
  teacher: "Teacher",
  academy: "Academy",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  const description = [
    `${KIND_LABELS[listing.kind]} in ${listing.area}, ${CITY}`,
    listing.subjects.map(subjectLabel).join(", "),
    classesText(listing.classes),
  ]
    .filter(Boolean)
    .join(". ");
  const url = `${SITE_URL}/t/${listing.slug}`;

  return {
    title: listing.name,
    description,
    openGraph: {
      title: listing.name,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
    },
  };
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 12 10 18 20 6" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <dt className="w-24 shrink-0 text-[15px] text-ink-2">{label}</dt>
      <dd className="text-[16px] leading-[24px] text-ink">{value}</dd>
    </div>
  );
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const waNumber = listing.whatsapp ?? listing.phone;
  const waUrl = whatsappUrl(waNumber, whatsappMessage(listing.ref_code));
  const callUrl = telUrl(listing.phone);
  const area = [listing.address, listing.area, CITY].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-[42rem] px-4 py-6">
      <Link href="/" className="text-[15px] text-blue">
        ‹ All teachers
      </Link>

      <h1 className="mt-4 text-[24px] leading-[30px] font-bold text-ink">{listing.name}</h1>
      <p className="mt-1 text-[15px] leading-[22px] text-ink-2">
        {KIND_LABELS[listing.kind]}
        {listing.contact_person ? `, run by ${listing.contact_person}` : ""}
      </p>

      {listing.subjects.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {listing.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-sm bg-blue-tint px-2 py-0.5 text-[13px] font-medium text-blue"
            >
              {subjectLabel(subject)}
            </span>
          ))}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={waUrl}
          className="flex h-12 items-center justify-center rounded-md bg-wa text-[16px] font-semibold text-white"
        >
          WhatsApp
        </a>
        <a
          href={callUrl}
          className="flex h-12 items-center justify-center gap-1.5 rounded-md bg-blue text-[16px] font-semibold text-white"
        >
          <PhoneIcon />
          Call
        </a>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-r-md border border-rule bg-paper">
        <div className="absolute inset-y-0 left-0 w-[2px] bg-margin" />
        <dl className="divide-y divide-rule">
          <Row label="Classes" value={classesText(listing.classes)} />
          {listing.boards.length > 0 && <Row label="Board" value={listing.boards.join(", ")} />}
          <Row
            label="Fees"
            value={
              <>
                <span className="tabular-nums">{feeText(listing.fee_min, listing.fee_max)}</span>
                {listing.fee_note && (
                  <span className="block text-[15px] text-ink-2">{listing.fee_note}</span>
                )}
              </>
            }
          />
          {listing.timings && <Row label="Timings" value={listing.timings} />}
          <Row label="Mode" value={`At ${listing.modes.map(modeLabel).join(", ")}`} />
          <Row label="Area" value={area} />
        </dl>
      </div>

      {listing.about && (
        <>
          <h2 className="mt-6 text-[17px] leading-[24px] font-semibold text-ink">About</h2>
          <p className="mt-2 max-w-prose text-[16px] leading-[24px] text-ink">{listing.about}</p>
        </>
      )}

      {listing.last_verified_at === null ? (
        <p className="mt-6 text-[13px] text-amber">
          Not yet confirmed. Please confirm with the teacher.
        </p>
      ) : isStale(listing.last_verified_at) ? (
        <p className="mt-6 text-[13px] text-amber">
          Details last confirmed {ago(listing.last_verified_at)}. Please confirm with the
          teacher.
        </p>
      ) : (
        <p className="mt-6 flex items-center gap-1 text-[13px] text-ink-3">
          <CheckIcon />
          Details confirmed {ago(listing.last_verified_at)}
        </p>
      )}
      <p className="mt-1 text-[13px] text-ink-3">Ref {listing.ref_code}</p>
    </div>
  );
}
