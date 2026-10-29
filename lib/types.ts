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

export type Channel = "whatsapp" | "call";

/** Mirrors the `listing_tap_counts` view in schema.md §2. */
export type TapCounts = {
  listing_id: string;
  whatsapp_total: number;
  call_total: number;
  whatsapp_30d: number;
  call_30d: number;
};
