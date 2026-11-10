import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { countNewRequests, getTapCounts, listAllListings, listNewSignups } from "@/lib/data";
import { ago, areaLabel, classesText, daysSince, isStale, subjectLabel } from "@/lib/format";
import { approveSignupAction, markVerifiedAction, rejectSignupAction, togglePublishedAction } from "./actions";

export const metadata: Metadata = { title: "Dashboard" };

const KIND_LABELS: Record<string, string> = { teacher: "Teacher", academy: "Academy" };

export default async function AdminDashboard() {
  await requireAdmin();

  const [allListings, tapCounts, newRequestCount, newSignups] = await Promise.all([
    listAllListings(),
    getTapCounts(),
    countNewRequests(),
    listNewSignups(),
  ]);
  const tapsByListing = new Map(tapCounts.map((t) => [t.listing_id, t]));

  // "New sign-ups" (below) is where an unreviewed /join sign-up lives; keep it out of the
  // main Listings table too, so it isn't shown twice with no Approve/Reject there.
  const newSignupIds = new Set(newSignups.map((l) => l.id));
  const listings = allListings.filter((l) => !newSignupIds.has(l.id));

  const liveCount = listings.filter((l) => l.published).length;
  const hiddenCount = listings.length - liveCount;
  const staleCount = listings.filter((l) => isStale(l.last_verified_at)).length;

  return (
    <div>
      <AdminHeader />
      <div className="mx-auto max-w-[42rem] px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-ink">Listings</h1>
          <Link
            href="/admin/new"
            className="flex h-11 items-center rounded-md bg-blue px-4 text-[15px] font-semibold text-white"
          >
            New listing
          </Link>
        </div>
        <p className="mt-2 text-[15px] text-ink-2">
          {liveCount} live, {hiddenCount} hidden, {staleCount} need re-confirming, {newRequestCount} new{" "}
          {newRequestCount === 1 ? "request" : "requests"}
        </p>

        {newSignups.length > 0 && (
          <div className="mt-4">
            <h2 className="text-[17px] font-semibold text-ink">New sign-ups</h2>
            <div className="mt-2 divide-y divide-rule rounded-md border border-rule bg-paper">
              {newSignups.map((listing) => (
                <div key={listing.id} className="p-4">
                  <p className="font-semibold text-ink">{listing.name}</p>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {KIND_LABELS[listing.kind]}, {areaLabel(listing.area, listing.area_other)}. Ref {listing.ref_code}.
                  </p>
                  {listing.classes.length > 0 && (
                    <p className="mt-1 text-[14px] text-ink-2">{classesText(listing.classes)}</p>
                  )}
                  {listing.subjects.length > 0 && (
                    <p className="mt-1 text-[14px] text-ink-2">{listing.subjects.map(subjectLabel).join(", ")}</p>
                  )}
                  <p className="mt-1 text-[14px] text-ink-2">{listing.phone}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/${listing.id}`}
                      className="flex h-11 items-center rounded-md border border-rule px-3 text-[14px] text-blue"
                    >
                      View details
                    </Link>
                    <form action={approveSignupAction.bind(null, listing.id)}>
                      <button type="submit" className="h-11 rounded-md bg-blue px-3 text-[14px] font-medium text-white">
                        Approve
                      </button>
                    </form>
                    <form action={rejectSignupAction.bind(null, listing.id)}>
                      <button type="submit" className="h-11 rounded-md border border-danger px-3 text-[14px] text-danger">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 divide-y divide-rule rounded-md border border-rule bg-paper">
          {listings.length === 0 ? (
            <p className="p-6 text-center text-[15px] text-ink-2">No listings yet.</p>
          ) : (
            listings.map((listing) => {
              const taps = tapsByListing.get(listing.id);
              const stale = isStale(listing.last_verified_at);

              return (
                <div key={listing.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{listing.name}</span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[13px] ${
                        listing.published
                          ? "bg-blue-tint text-blue"
                          : "border border-rule bg-paper text-ink-2"
                      }`}
                    >
                      {listing.published ? "Live" : "Hidden"}
                    </span>
                  </div>

                  <p className="mt-1 text-[14px] text-ink-2">
                    Ref {listing.ref_code}.{" "}
                    {listing.last_verified_at === null ? (
                      <span className="text-amber">Never confirmed</span>
                    ) : stale ? (
                      <span className="text-amber">
                        Not confirmed for {daysSince(listing.last_verified_at)} days
                      </span>
                    ) : (
                      `Confirmed ${ago(listing.last_verified_at)}`
                    )}
                  </p>

                  <p className="mt-1 text-[14px] text-ink-2 tabular-nums">
                    WhatsApp {taps?.whatsapp_30d ?? 0}, calls {taps?.call_30d ?? 0} in last 30 days (
                    {taps?.whatsapp_total ?? 0}, {taps?.call_total ?? 0} total)
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/${listing.id}`}
                      className="flex h-11 items-center rounded-md border border-rule px-3 text-[14px] text-blue"
                    >
                      Edit
                    </Link>
                    <form action={markVerifiedAction.bind(null, listing.id)}>
                      <button
                        type="submit"
                        className="h-11 rounded-md border border-rule px-3 text-[14px] text-blue"
                      >
                        Mark verified today
                      </button>
                    </form>
                    <form action={togglePublishedAction.bind(null, listing.id)}>
                      <button
                        type="submit"
                        className={`h-11 rounded-md border px-3 text-[14px] ${
                          listing.published ? "border-danger text-danger" : "border-rule text-blue"
                        }`}
                      >
                        {listing.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <a
                      href={`/api/qr/${listing.slug}`}
                      className="flex h-11 items-center rounded-md border border-rule px-3 text-[14px] text-blue"
                    >
                      Download QR
                    </a>
                    <a
                      href={`/t/${listing.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center rounded-md border border-rule px-3 text-[14px] text-blue"
                    >
                      View page
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
