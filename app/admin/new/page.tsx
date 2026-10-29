import type { Metadata } from "next";
import AdminHeader from "@/components/AdminHeader";
import ListingForm from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { emptyListingFormInput } from "@/lib/validation";
import { createListingAction } from "../actions";

export const metadata: Metadata = { title: "Add listing" };

export default async function NewListingPage() {
  await requireAdmin();

  return (
    <div>
      <AdminHeader />
      <div className="mx-auto max-w-[32rem] px-4 py-6">
        <h1 className="text-[22px] font-bold text-ink">Add listing</h1>
        <div className="mt-6">
          <ListingForm
            formAction={createListingAction}
            initialValues={emptyListingFormInput}
            consentAt={null}
            mode="new"
          />
        </div>
      </div>
    </div>
  );
}
