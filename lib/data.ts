/**
 * The only module allowed to talk to Supabase (rules.md §4). Everything here
 * runs on the server with the service-role key, which bypasses RLS on purpose
 * since there are no client-facing policies.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import { CITY } from "./config";
import { slugify } from "./format";
import type { Channel, Listing, RequestRecord, RequestStatus, SearchFilters, TapCounts, TeachingEntry } from "./types";
import { teachingEntriesUnion } from "./validation";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export type NewListing = Omit<Listing, "id" | "created_at" | "updated_at">;
export type ListingUpdate = Partial<NewListing>;

/** Published listings in the current city, filtered and ordered per schema.md §4.1. */
export async function searchListings(filters: SearchFilters): Promise<Listing[]> {
  let query = getClient().from("listings").select("*").eq("city", CITY).eq("published", true);

  if (filters.subject) query = query.contains("subjects", [filters.subject]);
  if (filters.class) query = query.contains("classes", [filters.class]);
  if (filters.mode) query = query.contains("modes", [filters.mode]);
  if (filters.area) query = query.eq("area", filters.area);

  // Cleaned again here, even though app/page.tsx already does it, since this is where the query is built.
  const q = filters.q?.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  if (q) {
    query = query.or(`name.ilike.%${q}%,contact_person.ilike.%${q}%,about.ilike.%${q}%`);
  }

  query = query.order("last_verified_at", { ascending: false, nullsFirst: false }).order("name", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Listing[];
}

/**
 * Count of published listings matching a subset of filters — the /request step 1 live
 * "N teachers match" line (app_flow.md R1, Phase 7). `subjects` matches any overlap,
 * since a parent can tick more than one.
 */
export async function countMatchingListings(filters: {
  class?: string;
  subjects?: string[];
  mode?: string;
}): Promise<number> {
  let query = getClient()
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("city", CITY)
    .eq("published", true);

  if (filters.class) query = query.contains("classes", [filters.class]);
  if (filters.mode) query = query.contains("modes", [filters.mode]);
  if (filters.subjects && filters.subjects.length > 0) query = query.overlaps("subjects", filters.subjects);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/** A single published listing for the public listing page. */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const { data, error } = await getClient()
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Listing | null) ?? null;
}

/** Every listing, published or not — for the admin dashboard. */
export async function listAllListings(): Promise<Listing[]> {
  const { data, error } = await getClient().from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

/** A single listing by id, published or not — for admin edit pages. */
export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await getClient().from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Listing | null) ?? null;
}

/** A single listing by slug, published or not — for admin QR codes. */
export async function getListingBySlugForAdmin(slug: string): Promise<Listing | null> {
  const { data, error } = await getClient().from("listings").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as Listing | null) ?? null;
}

export async function slugTaken(slug: string): Promise<boolean> {
  const { data, error } = await getClient().from("listings").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data !== null;
}

/** Appends -2, -3, ... until the slug is free (tech_spec.md §8). Shared by the admin form and /join. */
export async function uniqueSlug(candidate: string): Promise<string> {
  if (!(await slugTaken(candidate))) return candidate;
  let n = 2;
  while (await slugTaken(`${candidate}-${n}`)) n++;
  return `${candidate}-${n}`;
}

/** City initial + next free number, e.g. "D12". Never reused once assigned. */
export async function nextRefCode(): Promise<string> {
  const prefix = CITY.charAt(0).toUpperCase();
  const { data, error } = await getClient().from("listings").select("ref_code").like("ref_code", `${prefix}%`);
  if (error) throw error;

  const highest = (data ?? []).reduce((max, row) => {
    const match = /^[A-Za-z]+(\d+)$/.exec(row.ref_code as string);
    const n = match ? parseInt(match[1], 10) : 0;
    return n > max ? n : max;
  }, 0);

  return `${prefix}${highest + 1}`;
}

export async function createListing(input: NewListing): Promise<Listing> {
  const { data, error } = await getClient().from("listings").insert(input).select().single();
  if (error) throw error;
  return data as Listing;
}

export async function updateListing(id: string, input: ListingUpdate): Promise<Listing> {
  const { data, error } = await getClient().from("listings").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Listing;
}

/**
 * listings.subjects/classes stay the union of a listing's teaching_entries, rewritten on
 * every save (schema.md §3) — delete then re-insert is simpler and safe here since no other
 * table references teaching_entries rows by id.
 */
export async function replaceTeachingEntries(listingId: string, entries: TeachingEntry[]): Promise<void> {
  const client = getClient();
  const { error: deleteError } = await client.from("teaching_entries").delete().eq("listing_id", listingId);
  if (deleteError) throw deleteError;

  if (entries.length === 0) return;
  const rows = entries.map((entry, sort) => ({ listing_id: listingId, track: entry.track, classes: entry.classes, subjects: entry.subjects, sort }));
  const { error: insertError } = await client.from("teaching_entries").insert(rows);
  if (insertError) throw insertError;
}

export type NewSignup = {
  kind: Listing["kind"];
  name: string;
  contact_person: string | null;
  phone: string;
  whatsapp: string | null;
  area: string;
  area_other: string | null;
  address: string | null;
  serves_areas: string[];
  boards: string[];
  modes: string[];
  experience_years: number;
  qualification_level: string;
  qualification: string | null;
  languages: string[];
  fee_min: number | null;
  fee_max: number | null;
  fee_note: string | null;
  timings: string | null;
  headline: string | null;
  about: string;
  teaching_entries: TeachingEntry[];
};

/** J5 "Send" (app_flow.md, schema.md §4.8): saves unpublished, source='self'. */
export async function createSignup(input: NewSignup): Promise<Listing> {
  const slug = await uniqueSlug(slugify(input.name));
  const refCode = await nextRefCode();
  const { subjects, classes } = teachingEntriesUnion(input.teaching_entries);

  const listing = await createListing({
    slug,
    ref_code: refCode,
    kind: input.kind,
    name: input.name,
    contact_person: input.contact_person,
    phone: input.phone,
    whatsapp: input.whatsapp,
    subjects,
    classes,
    boards: input.boards,
    modes: input.modes,
    area: input.area,
    area_other: input.area_other,
    serves_areas: input.serves_areas,
    address: input.address,
    city: CITY,
    fee_min: input.fee_min,
    fee_max: input.fee_max,
    fee_note: input.fee_note,
    timings: input.timings,
    about: input.about,
    published: false,
    consent_at: new Date().toISOString(),
    last_verified_at: null,
    experience_years: input.experience_years,
    qualification_level: input.qualification_level,
    qualification: input.qualification,
    languages: input.languages,
    headline: input.headline,
    source: "self",
  });

  await replaceTeachingEntries(listing.id, input.teaching_entries);

  return listing;
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issues a fresh private edit link (app_flow.md Flow 8 step 3/5, schema.md §4.9): revokes
 * any still-active tokens for this listing first, so "issue a new link" is also how a
 * lost/leaked one gets cut off. Returns the raw token — only ever shown once, in the
 * WhatsApp message to the teacher; only its hash is stored.
 */
export async function createEditToken(listingId: string): Promise<string> {
  const client = getClient();

  const { error: revokeError } = await client
    .from("edit_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("listing_id", listingId)
    .is("revoked_at", null);
  if (revokeError) throw revokeError;

  const rawToken = randomBytes(24).toString("hex");
  const { error: insertError } = await client
    .from("edit_tokens")
    .insert({ listing_id: listingId, token_hash: hashToken(rawToken) });
  if (insertError) throw insertError;

  return rawToken;
}

/** /edit/[token] (Phase 8): looks the listing up by an un-revoked token's hash. No admin auth — this is the teacher's own no-password link. */
export async function getListingByEditToken(rawToken: string): Promise<Listing | null> {
  const { data: tokenRow, error: tokenError } = await getClient()
    .from("edit_tokens")
    .select("listing_id")
    .eq("token_hash", hashToken(rawToken))
    .is("revoked_at", null)
    .maybeSingle();
  if (tokenError) throw tokenError;
  if (!tokenRow) return null;

  return getListingById(tokenRow.listing_id as string);
}

/** "R" + next free number, e.g. "R12". Never reused once assigned (schema.md §3). */
export async function nextRequestRefCode(): Promise<string> {
  const { data, error } = await getClient().from("requests").select("ref_code").like("ref_code", "R%");
  if (error) throw error;

  const highest = (data ?? []).reduce((max, row) => {
    const match = /^R(\d+)$/.exec(row.ref_code as string);
    const n = match ? parseInt(match[1], 10) : 0;
    return n > max ? n : max;
  }, 0);

  return `R${highest + 1}`;
}

export type NewRequest = Omit<RequestRecord, "id" | "created_at" | "updated_at">;

export async function createRequest(input: NewRequest): Promise<RequestRecord> {
  const { data, error } = await getClient().from("requests").insert(input).select().single();
  if (error) throw error;
  return data as RequestRecord;
}

/** Every /request submission, newest first — for /admin/requests (app_flow.md A5). */
export async function listAllRequests(): Promise<RequestRecord[]> {
  const { data, error } = await getClient().from("requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RequestRecord[];
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<RequestRecord> {
  const { data, error } = await getClient().from("requests").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data as RequestRecord;
}

export async function getRequestById(id: string): Promise<RequestRecord | null> {
  const { data, error } = await getClient().from("requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as RequestRecord | null) ?? null;
}

/** Admin-ticked on /admin/requests (migration 0003) — gates whether "Send to teacher" includes the phone. */
export async function setShareNumberConsent(id: string, value: boolean): Promise<RequestRecord> {
  const { data, error } = await getClient()
    .from("requests")
    .update({ share_number_consent: value })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RequestRecord;
}

/** New-request count for the admin dashboard (app_flow.md A2). */
export async function countNewRequests(): Promise<number> {
  const { count, error } = await getClient()
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");
  if (error) throw error;
  return count ?? 0;
}

/** Published listings in the current city, unfiltered — for matching against /admin/requests. */
export async function listPublishedListings(): Promise<Listing[]> {
  const { data, error } = await getClient().from("listings").select("*").eq("city", CITY).eq("published", true);
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function logTap(listingId: string, channel: Channel, visitor: string | null): Promise<void> {
  const { error } = await getClient().from("taps").insert({ listing_id: listingId, channel, visitor });
  if (error) throw error;
}

/** De-duplicated tap counts per listing, for the admin dashboard. */
export async function getTapCounts(): Promise<TapCounts[]> {
  const { data, error } = await getClient().from("listing_tap_counts").select("*");
  if (error) throw error;
  return (data ?? []) as TapCounts[];
}
