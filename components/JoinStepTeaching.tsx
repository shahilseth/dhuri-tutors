"use client";

import { useState } from "react";
import { AREAS, BOARDS, MODES } from "@/lib/config";
import { modeLabel } from "@/lib/format";
import type { JoinDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepBackLink from "./StepBackLink";
import StepContinueButton from "./StepContinueButton";
import TeachingList from "./TeachingList";

function toggleValue(list: string[], value: string, checked: boolean): string[] {
  return checked ? [...list, value] : list.filter((v) => v !== value);
}

/** app_flow.md J2 "Teaching": the P8.2 teaching list, boards (once for the listing), mode, serves_areas when Home is ticked. */
export default function JoinStepTeaching({
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

  const showsServesAreas = draft.modes.includes("home");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.teaching_entries.length === 0) return setError("Add at least one thing you teach.");
    if (draft.modes.length === 0) return setError("Choose how you teach.");
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <TeachingList
        entries={draft.teaching_entries}
        onChange={(entries) => setDraft((d) => ({ ...d, teaching_entries: entries }))}
      />

      <div>
        <span className="text-[15px] font-medium text-ink">Boards (optional)</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {BOARDS.map((board) => (
            <OptionBox
              key={board}
              type="checkbox"
              name="boards"
              value={board}
              label={board}
              checked={draft.boards.includes(board)}
              onChange={(checked) => setDraft((d) => ({ ...d, boards: toggleValue(d.boards, board, checked) }))}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-[15px] font-medium text-ink">Mode</span>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <OptionBox
              key={m}
              type="checkbox"
              name="modes"
              value={m}
              label={modeLabel(m)}
              checked={draft.modes.includes(m)}
              onChange={(checked) => setDraft((d) => ({ ...d, modes: toggleValue(d.modes, m, checked) }))}
            />
          ))}
        </div>
      </div>

      {showsServesAreas && (
        <div>
          <span className="text-[15px] font-medium text-ink">Villages I can travel to (optional)</span>
          <div className="mt-1 flex flex-col gap-3">
            {AREAS.map((group) => (
              <div key={group.group}>
                <p className="mb-1 text-[13px] text-ink-3">{group.group}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((option) => (
                    <OptionBox
                      key={option.value}
                      type="checkbox"
                      name="serves_areas"
                      value={option.value}
                      label={option.label}
                      checked={draft.serves_areas.includes(option.value)}
                      onChange={(checked) =>
                        setDraft((d) => ({ ...d, serves_areas: toggleValue(d.serves_areas, option.value, checked) }))
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
