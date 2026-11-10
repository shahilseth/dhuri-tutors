"use server";

import { createRequest, countMatchingListings, nextRequestRefCode } from "@/lib/data";
import { requestSummary, requestWhatsappMessage, waUrlForNumber } from "@/lib/format";
import type { RequestDraft } from "@/lib/types";
import { requestDraftToFormInput, validateRequestInput, type RequestFormErrors } from "@/lib/validation";

/** Backs the R1 "N teachers match" live line (app_flow.md, Phase 7). Read-only, no auth needed. */
export async function getMatchCount(input: {
  classValue: string;
  subjects: string[];
  allSubjects: boolean;
  mode: string;
}): Promise<number> {
  return countMatchingListings({
    class: input.classValue || undefined,
    subjects: input.allSubjects ? undefined : input.subjects,
    mode: input.mode || undefined,
  });
}

export type CreateRequestResult =
  | { ok: true; refCode: string; whatsappUrl: string }
  | { ok: false; errors: RequestFormErrors };

/**
 * R4 "Send" (app_flow.md, schema.md §4.7): re-validates the whole draft server-side (no
 * step's client-side checks are trusted, rules.md §4), saves it, and builds the admin
 * WhatsApp link. design.md §11: this runs as soon as the parent reaches step 4 — the
 * WhatsApp tap afterwards is not what creates the record.
 */
export async function createRequestAction(draft: RequestDraft): Promise<CreateRequestResult> {
  const result = validateRequestInput(requestDraftToFormInput(draft));
  if (!result.ok) return { ok: false, errors: result.errors };

  const adminWhatsapp = process.env.ADMIN_WHATSAPP;
  if (!adminWhatsapp) throw new Error("ADMIN_WHATSAPP must be set");

  const refCode = await nextRequestRefCode();
  const v = result.value;

  await createRequest({
    ref_code: refCode,
    is_adult: v.is_adult,
    name: v.name,
    student_name: v.student_name,
    phone: v.phone,
    class: v.class,
    subjects: v.subjects,
    all_subjects: v.all_subjects,
    board: v.board,
    mode: v.mode,
    area: v.area,
    area_other: v.area_other,
    timings: v.timings,
    budget_min: v.budget_min,
    budget_max: v.budget_max,
    notes: v.notes,
    consent_at: new Date().toISOString(),
    // Separate from consent_at: the admin ticks this later, after confirming with the parent (migration 0003).
    share_number_consent: false,
    status: "new",
  });

  const summary = requestSummary({
    classValue: v.class,
    subjects: v.subjects,
    allSubjects: v.all_subjects,
    mode: v.mode,
    area: v.area,
    areaOther: v.area_other,
  });

  return {
    ok: true,
    refCode,
    whatsappUrl: waUrlForNumber(adminWhatsapp, requestWhatsappMessage(refCode, summary)),
  };
}
