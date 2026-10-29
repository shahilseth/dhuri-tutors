import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import CopyLinkButton from "@/components/CopyLinkButton";
import ListingForm from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/config";
import { getListingById } from "@/lib/data";
import { listingToFormInput } from "@/lib/validation";
import { updateListingAction } from "../actions";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publishError?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { publishError } = await searchParams;

  const listing = await getListingById(id);
  if (!listing) notFound();

  const publicUrl = `${SITE_URL}/t/${listing.slug}`;
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

        <div className="mt-6">
          <ListingForm
            formAction={boundUpdateAction}
            initialValues={listingToFormInput(listing)}
            consentAt={listing.consent_at}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
