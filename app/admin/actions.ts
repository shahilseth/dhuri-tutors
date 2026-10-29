"use server";

import { redirect } from "next/navigation";
import type { ListingFormState } from "@/components/ListingForm";
import { CITY } from "@/lib/config";
import { logIn, logOut, requireAdmin } from "@/lib/auth";
import { createListing, nextRefCode, slugTaken } from "@/lib/data";
import { parseListingFormData, validateListingInput } from "@/lib/validation";

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
    published: publish,
    consent_at: consentGiven ? new Date().toISOString() : null,
    last_verified_at: null,
  });

  redirect(`/admin/${listing.id}`);
}
