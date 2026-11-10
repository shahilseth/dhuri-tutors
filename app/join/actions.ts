"use server";

import { createSignup } from "@/lib/data";
import { signupWhatsappMessage, waUrlForNumber } from "@/lib/format";
import type { JoinDraft } from "@/lib/types";
import { joinDraftToFormInput, validateJoinInput, type JoinFormErrors } from "@/lib/validation";

export type CreateSignupResult =
  | { ok: true; refCode: string; whatsappUrl: string }
  | { ok: false; errors: JoinFormErrors };

/**
 * J5 "Send" (app_flow.md, schema.md §4.8): re-validates the whole draft server-side (no
 * step's client-side checks are trusted, rules.md §4), saves it unpublished with
 * source='self', and builds the admin WhatsApp link. design.md §11: this runs as soon as
 * the teacher reaches step 5 — the WhatsApp tap afterwards is not what creates the record.
 */
export async function createSignupAction(draft: JoinDraft): Promise<CreateSignupResult> {
  const result = validateJoinInput(joinDraftToFormInput(draft));
  if (!result.ok) return { ok: false, errors: result.errors };

  const adminWhatsapp = process.env.ADMIN_WHATSAPP;
  if (!adminWhatsapp) throw new Error("ADMIN_WHATSAPP must be set");

  const v = result.value;

  const listing = await createSignup({
    kind: v.kind,
    name: v.name,
    contact_person: v.contact_person,
    phone: v.phone,
    whatsapp: v.whatsapp,
    area: v.area,
    area_other: v.area_other,
    address: v.address,
    serves_areas: v.serves_areas,
    boards: v.boards,
    modes: v.modes,
    experience_years: v.experience_years,
    qualification_level: v.qualification_level,
    qualification: v.qualification,
    languages: v.languages,
    fee_min: v.fee_min,
    fee_max: v.fee_max,
    fee_note: v.fee_note,
    timings: v.timings,
    headline: v.headline,
    about: v.about,
    teaching_entries: v.teaching_entries,
  });

  return {
    ok: true,
    refCode: listing.ref_code,
    whatsappUrl: waUrlForNumber(adminWhatsapp, signupWhatsappMessage(listing.ref_code, v.name)),
  };
}
