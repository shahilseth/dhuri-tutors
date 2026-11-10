import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { getListingByEditToken, listTeachingEntriesByListingId } from "@/lib/data";
import { listingToFormInput } from "@/lib/validation";
import { updateOwnListingAction } from "./actions";

export const metadata: Metadata = { title: "Edit your listing" };
export const dynamic = "force-dynamic";

/**
 * app_flow.md Flow 8 step 4: the teacher's own no-password edit link, issued on admin
 * Approve (P8.8). No requireAdmin() — the token itself (checked fresh on every load and
 * every save) is the only gate.
 */
export default async function EditOwnListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { token } = await params;
  const { saved } = await searchParams;

  const listing = await getListingByEditToken(token);
  if (!listing) notFound();

  const teachingEntries = await listTeachingEntriesByListingId(listing.id);
  const boundUpdateAction = updateOwnListingAction.bind(null, token);

  return (
    <div className="mx-auto max-w-[32rem] px-4 py-6">
      <h1 className="text-[22px] font-bold text-ink">Edit your listing</h1>
      <p className="mt-1 text-[15px] text-ink-2">Ref {listing.ref_code}</p>

      {saved && (
        <p className="mt-4 rounded-md border border-rule bg-blue-tint p-3 text-[14px] text-blue">
          Saved. Parents will see the new details right away.
        </p>
      )}

      <div className="mt-6">
        <ListingForm
          formAction={boundUpdateAction}
          initialValues={listingToFormInput(listing, teachingEntries)}
          consentAt={listing.consent_at}
          mode="edit"
        />
      </div>
    </div>
  );
}
