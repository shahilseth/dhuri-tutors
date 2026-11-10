"use client";

import Link from "next/link";
import { useState } from "react";
import type { JoinDraft } from "@/lib/types";
import ListingPreview from "./ListingPreview";
import StepBackLink from "./StepBackLink";
import StepContinueButton from "./StepContinueButton";

/** app_flow.md J4 "Review": the real listing preview, an Edit link per step, consent. */
export default function JoinStepReview({
  draft,
  setDraft,
  backHref,
  onContinue,
}: {
  draft: JoinDraft;
  setDraft: (updater: (d: JoinDraft) => JoinDraft) => void;
  backHref: string;
  onContinue: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.consent) return setError("Please agree to be listed before continuing.");
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <div className="flex flex-wrap gap-3 text-[14px] font-semibold">
        <Link href="/join?step=1" className="text-blue-700 underline">
          Edit about you
        </Link>
        <Link href="/join?step=2" className="text-blue-700 underline">
          Edit teaching
        </Link>
        <Link href="/join?step=3" className="text-blue-700 underline">
          Edit profile
        </Link>
      </div>

      <ListingPreview draft={draft} />

      <label
        className={`flex items-start gap-2 rounded-md border-[1.5px] p-4 ${
          draft.consent ? "border-line bg-white" : "border-tint-2 bg-amber-tint"
        }`}
      >
        <input
          type="checkbox"
          checked={draft.consent}
          onChange={(e) => setDraft((d) => ({ ...d, consent: e.target.checked }))}
          className="mt-0.5 h-5 w-5 accent-blue-700"
        />
        <span className="text-[15px] text-ink">
          I agree to be listed publicly on Dhuri Tutors with these details.
        </span>
      </label>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
