"use client";

import { useState } from "react";
import { LANGUAGES, QUALIFICATIONS } from "@/lib/config";
import { languageLabel } from "@/lib/format";
import type { JoinDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepBackLink from "./StepBackLink";
import StepContinueButton from "./StepContinueButton";

const inputClass =
  "mt-1 block h-[54px] w-full rounded-md border-[1.5px] border-line bg-white px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15";

const HEADLINE_MAX = 80;
const ABOUT_MAX = 600;

function toggleValue(list: string[], value: string, checked: boolean): string[] {
  return checked ? [...list, value] : list.filter((v) => v !== value);
}

/** app_flow.md J3 "Profile": years teaching, qualification, languages, fees, timings, headline, about. */
export default function JoinStepProfile({
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
    const years = Number(draft.experience_years);
    if (!draft.experience_years.trim() || !Number.isInteger(years) || years < 0 || years > 60) {
      return setError("Enter years of teaching experience (0 to 60).");
    }
    if (!draft.qualification_level) return setError("Choose your highest qualification.");
    if (draft.languages.length === 0) return setError("Choose at least one teaching language.");
    if ((draft.fee_min && !draft.fee_max) || (!draft.fee_min && draft.fee_max)) {
      return setError("Enter both a minimum and a maximum fee, or leave both blank.");
    }
    if (draft.fee_min && draft.fee_max && Number(draft.fee_min) > Number(draft.fee_max)) {
      return setError("Maximum fee can't be less than the minimum fee.");
    }
    if (draft.headline.length > HEADLINE_MAX) return setError(`Headline must be ${HEADLINE_MAX} characters or fewer.`);
    if (!draft.about.trim()) return setError("Tell parents a little about yourself.");
    if (draft.about.length > ABOUT_MAX) return setError(`About must be ${ABOUT_MAX} characters or fewer.`);
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Years teaching</span>
        <input
          type="number"
          min={0}
          max={60}
          value={draft.experience_years}
          onChange={(e) => setDraft((d) => ({ ...d, experience_years: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Highest qualification</span>
        <select
          value={draft.qualification_level}
          onChange={(e) => setDraft((d) => ({ ...d, qualification_level: e.target.value }))}
          className={inputClass}
        >
          <option value="">Choose</option>
          {QUALIFICATIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Qualification details (optional)</span>
        <input
          type="text"
          placeholder="e.g. B.Ed, M.Sc Maths"
          value={draft.qualification}
          onChange={(e) => setDraft((d) => ({ ...d, qualification: e.target.value }))}
          className={inputClass}
        />
      </label>

      <div>
        <span className="text-[15px] font-medium text-ink">Teaching languages</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {LANGUAGES.map((language) => (
            <OptionBox
              key={language}
              type="checkbox"
              name="languages"
              value={language}
              label={languageLabel(language)}
              checked={draft.languages.includes(language)}
              onChange={(checked) => setDraft((d) => ({ ...d, languages: toggleValue(d.languages, language, checked) }))}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-[15px] font-medium text-ink">Monthly fee (optional)</span>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <input
            type="number"
            min={0}
            max={100000}
            placeholder="Min ₹"
            value={draft.fee_min}
            onChange={(e) => setDraft((d) => ({ ...d, fee_min: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            max={100000}
            placeholder="Max ₹"
            value={draft.fee_max}
            onChange={(e) => setDraft((d) => ({ ...d, fee_max: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Fee note (optional)</span>
        <input
          type="text"
          placeholder="e.g. per subject"
          value={draft.fee_note}
          onChange={(e) => setDraft((d) => ({ ...d, fee_note: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Timings (optional)</span>
        <input
          type="text"
          placeholder="e.g. Mon to Sat, 4 to 8 pm"
          value={draft.timings}
          onChange={(e) => setDraft((d) => ({ ...d, timings: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Short headline (optional)</span>
        <input
          type="text"
          maxLength={HEADLINE_MAX}
          value={draft.headline}
          onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
          className={inputClass}
        />
        <span className="mt-1 block text-right text-[13px] text-ink-3">
          {draft.headline.length}/{HEADLINE_MAX}
        </span>
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">About</span>
        <textarea
          value={draft.about}
          maxLength={ABOUT_MAX}
          onChange={(e) => setDraft((d) => ({ ...d, about: e.target.value }))}
          rows={4}
          className={`${inputClass} h-auto py-2`}
        />
        <span className="mt-1 block text-right text-[13px] text-ink-3">
          {draft.about.length}/{ABOUT_MAX}
        </span>
      </label>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
