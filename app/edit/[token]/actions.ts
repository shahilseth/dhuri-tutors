"use server";

import { redirect } from "next/navigation";
import type { ListingFormState } from "@/components/ListingForm";
import { getListingByEditToken, updateListing, uniqueSlug } from "@/lib/data";
import { parseListingFormData, validateListingInput } from "@/lib/validation";

/** Postgres check_violation (listings_publish_needs_consent): tried to clear consent while still published. */
function isConsentCheckViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23514";
}

/**
 * Bound with the raw token (`updateOwnListingAction.bind(null, token)`) before being passed
 * to ListingForm. No `requireAdmin()` — app_flow.md's private edit link has no password; the
 * token itself, looked up fresh on every submit, is the only check. Never touches
 * `published`: a leaked link can edit facts, not take a listing on/off the public site.
 */
export async function updateOwnListingAction(
  token: string,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const input = parseListingFormData(formData);
  const existing = await getListingByEditToken(token);
  if (!existing) {
    return { errors: {}, values: input, formError: "This link no longer works. Ask Dhuri Tutors for a new one." };
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
    await updateListing(existing.id, { ...result.value, slug, consent_at: consentAt });
  } catch (error) {
    if (isConsentCheckViolation(error)) {
      return {
        errors: {},
        values: input,
        formError: "This listing is live, so consent can't be removed here. Contact Dhuri Tutors.",
      };
    }
    throw error;
  }

  redirect(`/edit/${token}?saved=1`);
}
