"use server";

import { redirect } from "next/navigation";
import type { ListingFormState } from "@/components/ListingForm";
import { CITY } from "@/lib/config";
import { logIn, logOut, requireAdmin } from "@/lib/auth";
import {
  createListing,
  getListingById,
  nextRefCode,
  slugTaken,
  updateListing,
  updateRequestStatus,
} from "@/lib/data";
import type { RequestStatus } from "@/lib/types";
import { parseListingFormData, validateListingInput } from "@/lib/validation";

const REQUEST_STATUSES: RequestStatus[] = ["new", "contacted", "matched", "closed"];

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get("password");
  const ok = typeof password === "string" && (await logIn(password));
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logOut();
  redirect("/admin/login");
}

/** Appends -2, -3, ... until the slug is free (tech_spec.md §8). */
async function uniqueSlug(candidate: string): Promise<string> {
  if (!(await slugTaken(candidate))) return candidate;
  let n = 2;
  while (await slugTaken(`${candidate}-${n}`)) n++;
  return `${candidate}-${n}`;
}

export async function createListingAction(
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();

  const input = parseListingFormData(formData);
  const result = validateListingInput(input);
  if (!result.ok) {
    return { errors: result.errors, values: input };
  }

  const publish = formData.get("intent") === "publish";
  const consentGiven = formData.get("consent") === "yes";

  // rules.md §4: a listing can never be published without consent.
  if (publish && !consentGiven) {
    return {
      errors: {},
      values: input,
      formError: "The teacher must agree to be listed before you can publish.",
    };
  }

  const slug = await uniqueSlug(result.value.slug);
  const refCode = await nextRefCode();

  const listing = await createListing({
    ...result.value,
    slug,
    ref_code: refCode,
    city: CITY,
    // Only set from the Phase 8 self-sign-up form; the admin form has no field for it yet.
    serves_areas: [],
    published: publish,
    consent_at: consentGiven ? new Date().toISOString() : null,
    last_verified_at: null,
  });

  redirect(`/admin/${listing.id}`);
}

/** Postgres check_violation (listings_publish_needs_consent): tried to clear consent while still published. */
function isConsentCheckViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23514";
}

/** Bound with the listing id (`updateListingAction.bind(null, listing.id)`) before being passed to ListingForm. */
export async function updateListingAction(
  id: string,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();

  const input = parseListingFormData(formData);
  const existing = await getListingById(id);
  if (!existing) {
    return { errors: {}, values: input, formError: "This listing no longer exists." };
  }

  const result = validateListingInput(input);
  if (!result.ok) {
    return { errors: result.errors, values: input };
  }

  const consentGiven = formData.get("consent") === "yes";
  // tech_spec.md §8: consent_at is set the first time it's ticked, and kept after.
  const consentAt = consentGiven ? existing.consent_at ?? new Date().toISOString() : null;
  const slug = result.value.slug === existing.slug ? existing.slug : await uniqueSlug(result.value.slug);

  try {
    await updateListing(id, { ...result.value, slug, consent_at: consentAt });
  } catch (error) {
    if (isConsentCheckViolation(error)) {
      return {
        errors: {},
        values: input,
        formError: "You can't remove consent while this listing is published. Unpublish it first.",
      };
    }
    throw error;
  }

  redirect(`/admin/${id}`);
}

/** Bound with the listing id (app_flow.md A2: "Mark verified today"). */
export async function markVerifiedAction(id: string): Promise<void> {
  await requireAdmin();
  await updateListing(id, { last_verified_at: new Date().toISOString() });
  redirect("/admin");
}

/** Bound with the listing id (app_flow.md A2: "Publish/Unpublish"). */
export async function togglePublishedAction(id: string): Promise<void> {
  await requireAdmin();

  const listing = await getListingById(id);
  if (!listing) redirect("/admin");

  if (!listing.published) {
    // rules.md §4: a listing can never be published without consent, or without its required fields.
    const hasRequiredFields = listing.subjects.length > 0 && listing.classes.length > 0 && listing.modes.length > 0;
    if (!listing.consent_at || !hasRequiredFields) {
      redirect(`/admin/${id}?publishError=1`);
    }
  }

  await updateListing(id, { published: !listing.published });
  redirect("/admin");
}

/** Bound with the request id (app_flow.md A5: "change status"). */
export async function updateRequestStatusAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const status = formData.get("status");
  if (typeof status === "string" && REQUEST_STATUSES.includes(status as RequestStatus)) {
    await updateRequestStatus(id, status as RequestStatus);
  }

  redirect("/admin/requests");
}
