import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import CopyLinkButton from "@/components/CopyLinkButton";
import ListingForm from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/config";
import { getListingById, listTeachingEntriesByListingId } from "@/lib/data";
import { listingToFormInput } from "@/lib/validation";
import { updateListingAction } from "../actions";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publishError?: string; editToken?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { publishError, editToken } = await searchParams;

  const [listing, teachingEntries] = await Promise.all([
    getListingById(id),
    listTeachingEntriesByListingId(id),
  ]);
  if (!listing) notFound();

  const publicUrl = `${SITE_URL}/t/${listing.slug}`;
  const editUrl = editToken ? `${SITE_URL}/edit/${editToken}` : null;
  const boundUpdateAction = updateListingAction.bind(null, listing.id);

  return (
    <div>
      <AdminHeader />
      <div className="mx-auto max-w-[32rem] px-4 py-6">
        <h1 className="text-[22px] font-bold text-ink">{listing.name}</h1>
        <p className="mt-1 text-[15px] text-ink-2">Ref {listing.ref_code}</p>

        {publishError && (
          <p className="mt-4 rounded-md border border-danger bg-paper p-3 text-[14px] text-danger">
            Tick &ldquo;The teacher agreed to be listed on this site&rdquo; and save before publishing this
            listing.
          </p>
        )}

        {editUrl && (
          <div className="mt-4 rounded-md border border-rule bg-amber-tint p-3">
            <p className="text-[14px] font-medium text-ink">
              Private edit link — copy and send this now. It won&apos;t be shown again.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <a href={editUrl} target="_blank" rel="noreferrer" className="flex-1 truncate text-[15px] text-blue underline">
                {editUrl}
              </a>
              <CopyLinkButton url={editUrl} />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 rounded-md border border-rule bg-paper p-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-[15px] text-blue underline"
          >
            {publicUrl}
          </a>
          <CopyLinkButton url={publicUrl} />
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-md border border-rule bg-paper p-3">
          <Image
            src={`/api/qr/${listing.slug}`}
            alt="QR code linking to the public listing page"
            width={96}
            height={96}
            unoptimized
            className="rounded-sm"
          />
          <a
            href={`/api/qr/${listing.slug}`}
            className="flex h-11 items-center rounded-md border border-rule px-3 text-[14px] text-blue"
          >
            Download QR
          </a>
        </div>

        <div className="mt-6">
          <ListingForm
            formAction={boundUpdateAction}
            initialValues={listingToFormInput(listing, teachingEntries)}
            consentAt={listing.consent_at}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
