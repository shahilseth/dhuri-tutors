"use client";

import { useState } from "react";
import { AREAS, OTHER_AREA } from "@/lib/config";
import { looksLikePhone } from "@/lib/format";
import type { JoinDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepContinueButton from "./StepContinueButton";

const inputClass =
  "mt-1 block h-[54px] w-full rounded-md border-[1.5px] border-line bg-white px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15";

const NAME_MAX = 100;

/** app_flow.md J1 "About you": teacher/academy, name, academy name, phone, WhatsApp, area, address. */
export default function JoinStepAboutYou({
  draft,
  setDraft,
  onContinue,
}: {
  draft: JoinDraft;
  setDraft: (updater: (d: JoinDraft) => JoinDraft) => void;
  onContinue: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const isAcademy = draft.kind === "academy";
  const isOtherArea = draft.area === OTHER_AREA.value;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.kind) return setError("Choose teacher or academy.");
    if (!draft.name.trim()) return setError("Enter your full name.");
    if (draft.name.length > NAME_MAX) return setError(`Name must be ${NAME_MAX} characters or fewer.`);
    if (isAcademy && !draft.academy_name.trim()) return setError("Enter the academy's name.");
    if (!looksLikePhone(draft.phone)) {
      return setError("Phone number must be 10 digits, starting with 6, 7, 8 or 9.");
    }
    if (draft.whatsapp.trim() && !looksLikePhone(draft.whatsapp)) {
      return setError("WhatsApp number must be 10 digits, starting with 6, 7, 8 or 9.");
    }
    if (!draft.area) return setError("Choose where you live or teach from.");
    if (isOtherArea && !draft.area_other.trim()) return setError("Type the village name.");
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <span className="text-[15px] font-medium text-ink">Are you a teacher or an academy?</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <OptionBox
            type="radio"
            name="kind"
            value="teacher"
            label="Teacher"
            checked={draft.kind === "teacher"}
            onChange={() => setDraft((d) => ({ ...d, kind: "teacher" }))}
          />
          <OptionBox
            type="radio"
            name="kind"
            value="academy"
            label="Academy"
            checked={isAcademy}
            onChange={() => setDraft((d) => ({ ...d, kind: "academy" }))}
          />
        </div>
      </div>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Your full name</span>
        <input
          type="text"
          value={draft.name}
          maxLength={NAME_MAX}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className={inputClass}
        />
      </label>

      {isAcademy && (
        <label className="block">
          <span className="text-[15px] font-medium text-ink">Academy name</span>
          <input
            type="text"
            value={draft.academy_name}
            onChange={(e) => setDraft((d) => ({ ...d, academy_name: e.target.value }))}
            className={inputClass}
          />
        </label>
      )}

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Mobile number</span>
        <input
          type="tel"
          value={draft.phone}
          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">WhatsApp number, if different (optional)</span>
        <input
          type="tel"
          value={draft.whatsapp}
          onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Where you live or teach from</span>
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
        <span className="mt-1 block text-[13px] text-ink-3">
          Your exact address is never shown publicly unless you add it.
        </span>
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

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Address or landmark (optional)</span>
        <input
          type="text"
          value={draft.address}
          onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
          className={inputClass}
        />
      </label>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
