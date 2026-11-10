"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createRequestAction } from "@/app/request/actions";
import { areaLabel, classesText, feeText, modeLabel, subjectLabel, timingLabel } from "@/lib/format";
import type { RequestDraft } from "@/lib/types";
import StepBackLink from "./StepBackLink";

function SummarySection({
  title,
  editHref,
  rows,
}: {
  title: string;
  editHref: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        <Link href={editHref} className="text-[14px] font-semibold text-blue-700 underline">
          Edit
        </Link>
      </div>
      <dl className="mt-2 flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-[14px]">
            <dt className="text-ink-2">{row.label}</dt>
            <dd className="text-right text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** app_flow.md R4 "Send": summary with per-section Edit links, then saves and shows the WhatsApp button. */
export default function RequestStepSend({
  draft,
  setDraft,
  loaded,
  backHref,
}: {
  draft: RequestDraft;
  setDraft: (updater: (d: RequestDraft) => RequestDraft) => void;
  /** From useStepDraft: true once the saved draft (if any) has been read back from localStorage. */
  loaded: boolean;
  backHref: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    // Waits for `loaded`: on a direct/reloaded visit to step 4, the parent's own draft
    // hasn't been read back from localStorage yet on this component's first render, so
    // `draft` here would otherwise still be the empty starting value.
    if (!loaded || started.current) return;
    if (draft.ref_code) {
      setSaving(false);
      return;
    }
    started.current = true;
    createRequestAction(draft)
      .then((result) => {
        if (result.ok) {
          setDraft((d) => ({ ...d, ref_code: result.refCode, whatsapp_url: result.whatsappUrl }));
        } else {
          setError("Something in your answers doesn't look right. Please check each step and try again.");
        }
      })
      .catch(() => setError("Couldn't send your request. Please check your internet connection and try again."))
      .finally(() => setSaving(false));
    // Only `loaded` should re-trigger this: once it flips true, draft reflects the real
    // (possibly already-loaded) values and the request must only be saved a single time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (saving) {
    return (
      <div className="flex flex-col gap-5">
        <StepBackLink href={backHref} />
        <p className="text-[15px] text-ink-2">Sending your request…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <StepBackLink href={backHref} />
        <p className="text-[14px] text-danger">{error}</p>
        <Link href="/request?step=1" className="text-[15px] font-semibold text-blue-700 underline">
          Start from step 1
        </Link>
      </div>
    );
  }

  const budget = feeText(Number(draft.budget_min) || null, Number(draft.budget_max) || null);

  return (
    <div className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <p className="text-[15px] font-medium text-ink">
        Request sent — reference <span className="font-semibold">{draft.ref_code}</span>
      </p>

      <SummarySection
        title="What"
        editHref="/request?step=1"
        rows={[
          { label: "Class", value: draft.class ? classesText([draft.class]) : "Not set" },
          {
            label: "Subjects",
            value: draft.all_subjects ? "All subjects" : draft.subjects.map(subjectLabel).join(", ") || "Not set",
          },
          { label: "Board", value: draft.board || "Any" },
          { label: "Mode", value: draft.mode ? modeLabel(draft.mode) : "Not set" },
        ]}
      />

      <SummarySection
        title="Where and when"
        editHref="/request?step=2"
        rows={[
          { label: "Area", value: areaLabel(draft.area, draft.area_other) || "Not set" },
          { label: "Timings", value: draft.timings.map(timingLabel).join(", ") || "Not set" },
          { label: "Budget", value: budget === "Fee on request" ? "Not set" : budget },
        ]}
      />

      <SummarySection
        title="Your details"
        editHref="/request?step=3"
        rows={[
          { label: draft.is_adult === "no" ? "Parent's name" : "Your name", value: draft.name },
          ...(draft.is_adult === "no" ? [{ label: "Student", value: draft.student_name }] : []),
          { label: "Phone", value: draft.phone },
          { label: "Notes", value: draft.notes || "None" },
        ]}
      />

      <p className="text-[15px] text-ink-2">We&apos;ll reply on WhatsApp within 24 hours.</p>

      <a
        href={draft.whatsapp_url}
        target="_blank"
        rel="noreferrer"
        className="flex h-[54px] items-center justify-center rounded-md bg-wa text-[16px] font-bold text-white shadow-wa"
      >
        Send on WhatsApp
      </a>
    </div>
  );
}
