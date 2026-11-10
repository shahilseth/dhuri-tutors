import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactButtons from "@/components/ContactButtons";
import ListingDetailsSheet from "@/components/ListingDetailsSheet";
import { APP_NAME, CITY, SITE_URL } from "@/lib/config";
import { getListingBySlug } from "@/lib/data";
import {
  ago,
  areaLabel,
  classesText,
  isStale,
  shareUrl,
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
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
  // Defensive: `serves_areas` is a migration-0002 column, not yet applied on the dev
  // project as of 2026-11-10 (tracker.md) — guards against a row missing it entirely.
  const servesAreas = listing.serves_areas ?? [];
  const servesAreasText = servesAreas.length > 0 ? servesAreas.map((a) => areaLabel(a, null)).join(", ") : null;
  const shareWaUrl = shareUrl(listing.name, `${SITE_URL}/t/${listing.slug}`);

  return (
    <div className="mx-auto max-w-[42rem] px-4 pb-[96px] pt-6 md:px-6">
      <Link href="/" className="text-[15px] font-semibold text-blue-700">
        ‹ All teachers
      </Link>

      <h1 className="mt-4 text-[28px] font-extrabold leading-[1.15] tracking-[-0.025em] text-ink md:text-[36px]">
        {listing.name}
      </h1>
      <p className="mt-1 text-[15px] leading-[22px] text-ink-2">
        {KIND_LABELS[listing.kind]}
        {listing.contact_person ? `, run by ${listing.contact_person}` : ""}
      </p>

      {listing.last_verified_at !== null && !isStale(listing.last_verified_at) ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-sm bg-tint px-2.5 py-1 text-[12.5px] font-semibold text-blue-700">
          <CheckIcon />
          Details confirmed {ago(listing.last_verified_at)}
        </span>
      ) : (
        <span className="mt-2 inline-flex items-center gap-1 rounded-sm bg-amber-tint px-2.5 py-1 text-[12.5px] font-semibold text-amber">
          {listing.last_verified_at === null
            ? "Not yet confirmed"
            : `Details last confirmed ${ago(listing.last_verified_at)}`}
        </span>
      )}

      {listing.subjects.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-1.5">
          {listing.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-sm bg-tint px-2.5 py-1 text-[13px] font-semibold text-blue-700"
            >
              {subjectLabel(subject)}
            </span>
          ))}
        </p>
      )}

      <ListingDetailsSheet
        classes={listing.classes}
        boards={listing.boards}
        feeMin={listing.fee_min}
        feeMax={listing.fee_max}
        feeNote={listing.fee_note}
        timings={listing.timings}
        modes={listing.modes}
        areaText={area}
        servesAreasText={servesAreasText}
        languages={listing.languages ?? []}
      />

      {listing.about && (
        <div className="mt-4 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-6">
          <h2 className="text-[17px] leading-[24px] font-bold text-ink">About</h2>
          <p className="mt-2 max-w-prose text-[16px] leading-[24px] text-ink">{listing.about}</p>
        </div>
      )}

      <p className="mt-4 text-[13px] text-ink-3">Ref {listing.ref_code}</p>

      <a
        href={shareWaUrl}
        className="mt-4 flex h-[54px] items-center justify-center rounded-md border-[1.5px] border-line bg-white text-[16px] font-bold text-blue-700"
      >
        Share this page on WhatsApp
      </a>

      <div
        className="fixed inset-x-0 bottom-0 border-t border-line bg-white/96 px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-[42rem]">
          <ContactButtons slug={listing.slug} whatsappUrl={waUrl} callUrl={callUrl} />
        </div>
      </div>
    </div>
  );
}
