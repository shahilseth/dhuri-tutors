"use client";

import { useState } from "react";
import { looksLikePhone } from "@/lib/format";
import type { RequestDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepBackLink from "./StepBackLink";
import StepContinueButton from "./StepContinueButton";

const inputClass =
  "mt-1 block h-12 w-full rounded-md border border-rule bg-paper px-3 text-[16px] text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/25";

const NOTES_MAX = 300;

/** app_flow.md R3 "Your details": adult/minor branching, notes, consent. */
export default function RequestStepYourDetails({
  draft,
  setDraft,
  backHref,
  onContinue,
}: {
  draft: RequestDraft;
  setDraft: (updater: (d: RequestDraft) => RequestDraft) => void;
  backHref: string;
  onContinue: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const isAdult = draft.is_adult === "yes";
  const isMinor = draft.is_adult === "no";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.is_adult) return setError("Tell us if you're 18 or older.");
    if (isMinor && !draft.student_name.trim()) return setError("Enter the student's first name.");
    if (!draft.name.trim()) return setError(isMinor ? "Enter your parent's name." : "Enter your name.");
    if (!looksLikePhone(draft.phone)) {
      return setError("Phone number must be 10 digits, starting with 6, 7, 8 or 9.");
    }
    if (draft.notes.length > NOTES_MAX) return setError(`Notes must be ${NOTES_MAX} characters or fewer.`);
    if (!draft.consent) return setError("Please agree to share this request with matching teachers.");
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <div>
        <span className="text-[15px] font-medium text-ink">Are you 18 or older?</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <OptionBox
            type="radio"
            name="is_adult"
            value="yes"
            label="Yes"
            checked={isAdult}
            onChange={() => setDraft((d) => ({ ...d, is_adult: "yes", student_name: "" }))}
          />
          <OptionBox
            type="radio"
            name="is_adult"
            value="no"
            label="No"
            checked={isMinor}
            onChange={() => setDraft((d) => ({ ...d, is_adult: "no" }))}
          />
        </div>
      </div>

      {isMinor && (
        <>
          <p className="text-[14px] text-ink-2">We&apos;ll talk to your parent.</p>
          <label className="block">
            <span className="text-[15px] font-medium text-ink">Student&apos;s first name</span>
            <input
              type="text"
              value={draft.student_name}
              onChange={(e) => setDraft((d) => ({ ...d, student_name: e.target.value }))}
              className={inputClass}
            />
          </label>
        </>
      )}

      <label className="block">
        <span className="text-[15px] font-medium text-ink">{isMinor ? "Parent's name" : "Your name"}</span>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">
          {isMinor ? "Parent's mobile number" : "Your mobile number"}
        </span>
        <input
          type="tel"
          value={draft.phone}
          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Anything else? (optional)</span>
        <textarea
          value={draft.notes}
          maxLength={NOTES_MAX}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          rows={3}
          className={`${inputClass} h-auto py-2`}
        />
        <span className="mt-1 block text-right text-[13px] text-ink-3">
          {draft.notes.length}/{NOTES_MAX}
        </span>
      </label>

      <label
        className={`flex items-start gap-2 rounded-md border border-rule p-3 ${draft.consent ? "" : "bg-amber-tint"}`}
      >
        <input
          type="checkbox"
          checked={draft.consent}
          onChange={(e) => setDraft((d) => ({ ...d, consent: e.target.checked }))}
          className="mt-0.5 h-5 w-5"
        />
        <span className="text-[15px] text-ink">I agree to share this request with matching teachers.</span>
      </label>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
