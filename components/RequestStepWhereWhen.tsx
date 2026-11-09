"use client";

import { useState } from "react";
import { AREAS, OTHER_AREA, TIMINGS } from "@/lib/config";
import { timingLabel } from "@/lib/format";
import type { RequestDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepBackLink from "./StepBackLink";
import StepContinueButton from "./StepContinueButton";

const inputClass =
  "mt-1 block h-12 w-full rounded-md border border-rule bg-paper px-3 text-[16px] text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/25";

/** app_flow.md R2 "Where and when": area (optgroups + "Other village"), timings, budget min/max. */
export default function RequestStepWhereWhen({
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

  const isOtherArea = draft.area === OTHER_AREA.value;

  function toggleTiming(value: string, checked: boolean) {
    setDraft((d) => ({
      ...d,
      timings: checked ? [...d.timings, value] : d.timings.filter((t) => t !== value),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.area) return setError("Choose an area.");
    if (isOtherArea && !draft.area_other.trim()) return setError("Type the village name.");
    if (draft.timings.length === 0) return setError("Choose at least one timing.");
    if (
      draft.budget_min &&
      draft.budget_max &&
      Number(draft.budget_min) > Number(draft.budget_max)
    ) {
      return setError("Maximum budget can't be less than the minimum budget.");
    }
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Area</span>
        <select
          value={draft.area}
          onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value, area_other: "" }))}
          className={inputClass}
        >
          <option value="">Choose an area</option>
          {AREAS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER_AREA.value}>{OTHER_AREA.label}</option>
        </select>
      </label>

      {isOtherArea && (
        <label className="block">
          <span className="text-[15px] font-medium text-ink">Village name</span>
          <input
            type="text"
            value={draft.area_other}
            onChange={(e) => setDraft((d) => ({ ...d, area_other: e.target.value }))}
            className={inputClass}
          />
        </label>
      )}

      <div>
        <span className="text-[15px] font-medium text-ink">Preferred timings</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {TIMINGS.map((timing) => (
            <OptionBox
              key={timing}
              type="checkbox"
              name="timings"
              value={timing}
              label={timingLabel(timing)}
              checked={draft.timings.includes(timing)}
              onChange={(checked) => toggleTiming(timing, checked)}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-[15px] font-medium text-ink">Monthly budget (optional)</span>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <input
            type="number"
            min={0}
            max={100000}
            placeholder="Min ₹"
            value={draft.budget_min}
            onChange={(e) => setDraft((d) => ({ ...d, budget_min: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            max={100000}
            placeholder="Max ₹"
            value={draft.budget_max}
            onChange={(e) => setDraft((d) => ({ ...d, budget_max: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
