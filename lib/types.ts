/** Mirrors the `listings` table in schema.md §2. */
export type ListingKind = "teacher" | "academy";

export type Listing = {
  id: string;
  slug: string;
  ref_code: string;
  kind: ListingKind;
  name: string;
  contact_person: string | null;
  phone: string;
  whatsapp: string | null;
  subjects: string[];
  classes: string[];
  boards: string[];
  modes: string[];
  area: string;
  /** Villages a home tutor also travels to, beyond `area` (migration 0002, Phase 8). Used by P7.9's request matching. */
  serves_areas: string[];
  address: string | null;
  city: string;
  fee_min: number | null;
  fee_max: number | null;
  fee_note: string | null;
  timings: string | null;
  about: string | null;
  published: boolean;
  consent_at: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Public search params, each a single value (a listing's own fields are arrays). */
export type SearchFilters = {
  subject?: string;
  class?: string;
  area?: string;
  mode?: string;
  q?: string;
};

/** Client-side draft for the /request multi-step form (app_flow.md R1–R4, Phase 7). */
export type RequestDraft = {
  class: string;
  subjects: string[];
  all_subjects: boolean;
  board: string;
  mode: string;
  area: string;
  area_other: string;
  timings: string[];
  budget_min: string;
  budget_max: string;
  is_adult: string;
  name: string;
  student_name: string;
  phone: string;
  notes: string;
  consent: boolean;
  /** Set by RequestStepSend once the request is saved, so a reload of step 4 doesn't save it twice. */
  ref_code: string;
  /** Persisted alongside ref_code — ADMIN_WHATSAPP is server-only, so it can't be rebuilt on the client after a reload. */
  whatsapp_url: string;
};

/** Mirrors the `requests` table in schema.md §3 (migration 0002, Phase 7). */
export type RequestStatus = "new" | "contacted" | "matched" | "closed";

export type RequestRecord = {
  id: string;
  ref_code: string;
  is_adult: boolean;
  name: string;
  student_name: string | null;
  phone: string;
  class: string | null;
  subjects: string[];
  all_subjects: boolean;
  board: string | null;
  mode: string | null;
  area: string | null;
  area_other: string | null;
  timings: string[];
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  consent_at: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type Channel = "whatsapp" | "call";

/** Mirrors the `listing_tap_counts` view in schema.md §2. */
export type TapCounts = {
  listing_id: string;
  whatsapp_total: number;
  call_total: number;
  whatsapp_30d: number;
  call_30d: number;
};
