"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMatchCount } from "@/app/request/actions";
import { BOARDS, CLASSES, MODES, SUBJECTS } from "@/lib/config";
import { modeLabel } from "@/lib/format";
import type { RequestDraft } from "@/lib/types";
import OptionBox from "./OptionBox";
import StepContinueButton from "./StepContinueButton";

const SUBJECT_OPTIONS = SUBJECTS.flatMap((g) => g.options);

const selectClass =
  "mt-1 block h-12 w-full rounded-md border border-rule bg-paper px-3 text-[16px] text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/25";

/** app_flow.md R1 "What": class, subjects (search-as-you-type + "All subjects"), board, mode. */
export default function RequestStepWhat({
  draft,
  setDraft,
  onContinue,
}: {
  draft: RequestDraft;
  setDraft: (updater: (d: RequestDraft) => RequestDraft) => void;
  onContinue: () => void;
}) {
  const [subjectQuery, setSubjectQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredSubjects = subjectQuery
    ? SUBJECT_OPTIONS.filter((o) => o.label.toLowerCase().includes(subjectQuery.toLowerCase()))
    : SUBJECT_OPTIONS;

  const hasAnyFilter = Boolean(draft.class) || draft.subjects.length > 0 || draft.all_subjects || Boolean(draft.mode);

  useEffect(() => {
    if (!hasAnyFilter) {
      setMatchCount(null);
      return;
    }
    const timer = setTimeout(() => {
      getMatchCount({
        classValue: draft.class,
        subjects: draft.subjects,
        allSubjects: draft.all_subjects,
        mode: draft.mode,
      })
        .then(setMatchCount)
        .catch(() => setMatchCount(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [hasAnyFilter, draft.class, draft.subjects, draft.all_subjects, draft.mode]);

  function toggleSubject(value: string, checked: boolean) {
    setDraft((d) => ({
      ...d,
      subjects: checked ? [...d.subjects, value] : d.subjects.filter((s) => s !== value),
    }));
  }

  function matchHref(): string {
    const params = new URLSearchParams();
    if (draft.class) params.set("class", draft.class);
    if (draft.mode) params.set("mode", draft.mode);
    // The public search page only takes one subject; only pass one through when that's unambiguous.
    if (!draft.all_subjects && draft.subjects.length === 1) params.set("subject", draft.subjects[0]);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.class) return setError("Choose a class.");
    if (!draft.all_subjects && draft.subjects.length === 0) {
      return setError("Choose at least one subject, or 'All subjects for this class'.");
    }
    if (!draft.mode) return setError("Choose how you'd like tuition.");
    setError(null);
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="block">
        <span className="text-[15px] font-medium text-ink">Class</span>
        <select
          value={draft.class}
          onChange={(e) => setDraft((d) => ({ ...d, class: e.target.value }))}
          className={selectClass}
        >
          <option value="">Choose a class</option>
          {CLASSES.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div>
        <span className="text-[15px] font-medium text-ink">Subjects</span>
        <div className="mt-1">
          <OptionBox
            type="checkbox"
            name="all_subjects"
            value="yes"
            label="All subjects for this class"
            checked={draft.all_subjects}
            onChange={(checked) =>
              setDraft((d) => ({ ...d, all_subjects: checked, subjects: checked ? [] : d.subjects }))
            }
          />
        </div>

        {!draft.all_subjects && (
          <>
            <input
              type="text"
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              placeholder="Search subjects"
              className={`${selectClass} mt-3`}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {filteredSubjects.map((option) => (
                <OptionBox
                  key={option.value}
                  type="checkbox"
                  name="subjects"
                  value={option.value}
                  label={option.label}
                  checked={draft.subjects.includes(option.value)}
                  onChange={(checked) => toggleSubject(option.value, checked)}
                />
              ))}
              {filteredSubjects.length === 0 && (
                <p className="col-span-2 text-[15px] text-ink-2">No subjects match &quot;{subjectQuery}&quot;.</p>
              )}
            </div>
          </>
        )}
      </div>

      <label className="block">
        <span className="text-[15px] font-medium text-ink">Board (optional)</span>
        <select
          value={draft.board}
          onChange={(e) => setDraft((d) => ({ ...d, board: e.target.value }))}
          className={selectClass}
        >
          <option value="">Any board</option>
          {BOARDS.map((board) => (
            <option key={board} value={board}>
              {board}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-[15px] font-medium text-ink">Mode</span>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <OptionBox
              key={m}
              type="radio"
              name="mode"
              value={m}
              label={modeLabel(m)}
              checked={draft.mode === m}
              onChange={() => setDraft((d) => ({ ...d, mode: m }))}
            />
          ))}
        </div>
      </div>

      {matchCount !== null && (
        <p className="text-[15px] text-ink-2">
          {matchCount} {matchCount === 1 ? "teacher" : "teachers"} match.{" "}
          <Link href={matchHref()} className="text-blue underline">
            See them now.
          </Link>
        </p>
      )}

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <StepContinueButton />
    </form>
  );
}
