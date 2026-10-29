/**
 * The only module allowed to talk to Supabase (rules.md §4). Everything here
 * runs on the server with the service-role key, which bypasses RLS on purpose
 * since there are no client-facing policies.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CITY } from "./config";
import type { Channel, Listing, SearchFilters, TapCounts } from "./types";

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

export async function slugTaken(slug: string): Promise<boolean> {
  const { data, error } = await getClient().from("listings").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data !== null;
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
