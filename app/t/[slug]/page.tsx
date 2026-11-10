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
  const servesAreasText =
    listing.serves_areas.length > 0 ? listing.serves_areas.map((a) => areaLabel(a, null)).join(", ") : null;
  const shareWaUrl = shareUrl(listing.name, `${SITE_URL}/t/${listing.slug}`);

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

      <ContactButtons slug={listing.slug} whatsappUrl={waUrl} callUrl={callUrl} />

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
      />

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

      <a
        href={shareWaUrl}
        className="mt-6 flex h-12 items-center justify-center rounded-md border border-rule bg-paper text-[16px] font-semibold text-blue"
      >
        Share this page on WhatsApp
      </a>
    </div>
  );
}
