import type { Metadata } from "next";
import AdminHeader from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { listAllRequests, listPublishedListings } from "@/lib/data";
import {
  ago,
  areaLabel,
  classesText,
  feeText,
  requestOutreachMessage,
  requestSummary,
  subjectLabel,
  timingLabel,
  whatsappUrl,
} from "@/lib/format";
import type { Listing, RequestRecord, RequestStatus } from "@/lib/types";
import { toggleShareNumberConsentAction, updateRequestStatusAction } from "../actions";

export const metadata: Metadata = { title: "Requests" };

const STATUS_OPTIONS: RequestStatus[] = ["new", "contacted", "matched", "closed"];

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  matched: "Matched",
  closed: "Closed",
};

/** A listing matches a request on class, subject and area (app_flow.md A5: "area or serves_areas"). */
function matchingListings(request: RequestRecord, listings: Listing[]): Listing[] {
  return listings.filter((listing) => {
    if (request.class && !listing.classes.includes(request.class)) return false;

    if (!request.all_subjects && request.subjects.length > 0) {
      if (!request.subjects.some((s) => listing.subjects.includes(s))) return false;
    }

    if (request.area) {
      // Defensive: `serves_areas` is a migration-0002 column that may be missing on a row
      // if the migration hasn't been applied yet (tracker.md) — found crashing live in
      // app/t/[slug]/page.tsx during P8.7's verification, same root cause here.
      const areaMatches = listing.area === request.area || (listing.serves_areas ?? []).includes(request.area);
      if (!areaMatches) return false;
    }

    return true;
  });
}

/** "No teacher found" report (app_flow.md A5): requests with zero matches, grouped by subject/class/village. */
function noMatchGroups(requests: RequestRecord[], listings: Listing[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const request of requests) {
    if (matchingListings(request, listings).length > 0) continue;

    const classText = request.class ? classesText([request.class]) : "any class";
    const subjectText = request.all_subjects
      ? "all subjects"
      : request.subjects.map(subjectLabel).join(", ") || "no subject chosen";
    const areaText = areaLabel(request.area, request.area_other) || "any area";
    const label = `${classText}, ${subjectText} — ${areaText}`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const style =
    status === "new"
      ? "bg-blue-tint text-blue"
      : status === "closed"
        ? "border border-rule bg-paper text-ink-2"
        : "bg-amber-tint text-amber";
  return <span className={`rounded-sm px-2 py-0.5 text-[13px] ${style}`}>{STATUS_LABELS[status]}</span>;
}

export default async function AdminRequests() {
  await requireAdmin();

  const [requests, listings] = await Promise.all([listAllRequests(), listPublishedListings()]);
  const groups = noMatchGroups(requests, listings);

  return (
    <div>
      <AdminHeader />
      <div className="mx-auto max-w-[42rem] px-4 py-6">
        <h1 className="text-[22px] font-bold text-ink">Requests</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          {requests.length} {requests.length === 1 ? "request" : "requests"}, {requests.filter((r) => r.status === "new").length}{" "}
          new
        </p>

        {groups.length > 0 && (
          <div className="mt-4 rounded-md border border-rule bg-paper p-4">
            <h2 className="text-[15px] font-semibold text-ink">No teacher found</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {groups.map((group) => (
                <li key={group.label} className="text-[14px] text-ink-2">
                  {group.label}: {group.count} {group.count === 1 ? "request" : "requests"}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 divide-y divide-rule rounded-md border border-rule bg-paper">
          {requests.length === 0 ? (
            <p className="p-6 text-center text-[15px] text-ink-2">No requests yet.</p>
          ) : (
            requests.map((request) => {
              const matches = matchingListings(request, listings);
              const summary = requestSummary({
                classValue: request.class,
                subjects: request.subjects,
                allSubjects: request.all_subjects,
                mode: request.mode,
                area: request.area,
                areaOther: request.area_other,
              });

              return (
                <div key={request.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">Ref {request.ref_code}</span>
                    <StatusBadge status={request.status} />
                  </div>

                  <p className="mt-1 text-[14px] text-ink-2">{summary}</p>

                  {request.timings.length > 0 && (
                    <p className="mt-1 text-[14px] text-ink-2">Timings: {request.timings.map(timingLabel).join(", ")}</p>
                  )}

                  {(request.budget_min != null || request.budget_max != null) && (
                    <p className="mt-1 text-[14px] text-ink-2">Budget: {feeText(request.budget_min, request.budget_max)}</p>
                  )}

                  <p className="mt-1 text-[14px] text-ink-2">
                    {request.student_name ? `${request.student_name} (parent: ${request.name})` : request.name},{" "}
                    {request.phone}
                  </p>

                  {request.notes && <p className="mt-1 text-[14px] text-ink-2">Notes: {request.notes}</p>}

                  <p className="mt-1 text-[13px] text-ink-3">{ago(request.created_at)}</p>

                  <form action={toggleShareNumberConsentAction.bind(null, request.id)} className="mt-3">
                    <button
                      type="submit"
                      className={`h-11 rounded-md border px-3 text-[14px] ${
                        request.share_number_consent ? "border-blue text-blue" : "border-rule text-ink-2"
                      }`}
                    >
                      {request.share_number_consent ? "✓ Parent agreed to share number" : "Parent agreed to share number?"}
                    </button>
                  </form>

                  <div className="mt-3">
                    <h3 className="text-[14px] font-medium text-ink">Matching teachers</h3>
                    {matches.length === 0 ? (
                      <p className="mt-1 text-[14px] text-ink-2">None yet.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matches.map((listing) => (
                          <a
                            key={listing.id}
                            href={whatsappUrl(
                              listing.whatsapp ?? listing.phone,
                              requestOutreachMessage(
                                request.ref_code,
                                summary,
                                request.name,
                                request.share_number_consent ? request.phone : null,
                              ),
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-11 items-center rounded-md bg-wa px-3 text-[14px] font-medium text-white"
                          >
                            Send to {listing.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <form action={updateRequestStatusAction.bind(null, request.id)} className="mt-3 flex items-center gap-2">
                    <select
                      name="status"
                      defaultValue={request.status}
                      className="h-11 rounded-md border border-rule bg-paper px-2 text-[14px] text-ink"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="h-11 rounded-md border border-rule px-3 text-[14px] text-blue">
                      Update status
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
