"use client";

import { useState } from "react";
import { CLASSES, SUBJECTS } from "@/lib/config";
import { classesText, subjectLabel } from "@/lib/format";
import type { TeachingEntry, TeachingTrack } from "@/lib/types";
import OptionBox from "./OptionBox";

// "College" (bcom/ba/bsc/bca/other-college) isn't offered here: teaching_entries.track is
// constrained to school/exam/skill (migration 0002), owner-confirmed 2026-11-10 — see
// tracker.md Blockers. Only the three groups below are reachable from this component.
const SCHOOL_CLASSES = CLASSES.find((g) => g.group === "School")!.options;
const EXAM_CLASSES = CLASSES.find((g) => g.group === "Entrance and competitive exams")!.options;
const SCHOOL_SUBJECTS = SUBJECTS.find((g) => g.group === "School subjects")!.options;
const EXAM_PREP_SUBJECTS = SUBJECTS.find((g) => g.group === "Exam preparation")!.options;
const SKILL_SUBJECTS = SUBJECTS.find((g) => g.group === "Skills and extra classes")!.options;
// Exam-track subjects cover both academic exams (JEE/NEET need Physics, Maths, ...) and
// non-academic ones (SSC/Banking/Police need Reasoning, GK, ...), so the options are the
// union of "School subjects" and "Exam preparation" rather than either group alone.
const EXAM_SUBJECTS = [...SCHOOL_SUBJECTS, ...EXAM_PREP_SUBJECTS];

const TABS: { track: TeachingTrack; label: string }[] = [
  { track: "school", label: "School" },
  { track: "exam", label: "Entrance and competitive exams" },
  { track: "skill", label: "Skills and activities" },
];

const selectClass =
  "mt-1 block h-[54px] w-full rounded-md border-[1.5px] border-line bg-white px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15";

function entrySummary(entry: TeachingEntry): string {
  const subjects = entry.subjects.map(subjectLabel).join(", ") || "No subjects";
  if (entry.track === "skill") return `Skills: ${subjects}`;
  if (entry.track === "exam") return `Exam: ${classesText(entry.classes)} — ${subjects}`;
  return `School: ${classesText(entry.classes)} — ${subjects}`;
}

function toggleValue(list: string[], value: string, checked: boolean): string[] {
  return checked ? [...list, value] : list.filter((v) => v !== value);
}

/**
 * Shared "add to teaching list" component (app_flow.md J2; schema.md §3 `teaching_entries`).
 * Used by /join (P8.3) and the admin listing form (P8.8). Each tab keeps its own unfinished
 * selection in local state so switching tabs doesn't lose it — only finished entries live in
 * the `entries` prop, which is what's persisted (draft localStorage, or the admin form state).
 */
export default function TeachingList({
  entries,
  onChange,
}: {
  entries: TeachingEntry[];
  onChange: (entries: TeachingEntry[]) => void;
}) {
  const [tab, setTab] = useState<TeachingTrack>("school");
  const [error, setError] = useState<string | null>(null);

  const [schoolFrom, setSchoolFrom] = useState("");
  const [schoolTo, setSchoolTo] = useState("");
  const [schoolSubjects, setSchoolSubjects] = useState<string[]>([]);

  const [examValue, setExamValue] = useState("");
  const [examSubjects, setExamSubjects] = useState<string[]>([]);

  const [skillSubjects, setSkillSubjects] = useState<string[]>([]);

  function addEntry(entry: TeachingEntry) {
    onChange([...entries, entry]);
    setError(null);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function addSchool() {
    if (!schoolFrom || !schoolTo) return setError("Choose a class range.");
    if (schoolSubjects.length === 0) return setError("Choose at least one subject.");
    const fromIndex = SCHOOL_CLASSES.findIndex((o) => o.value === schoolFrom);
    const toIndex = SCHOOL_CLASSES.findIndex((o) => o.value === schoolTo);
    const [lo, hi] = fromIndex <= toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    const classes = SCHOOL_CLASSES.slice(lo, hi + 1).map((o) => o.value);
    addEntry({ track: "school", classes, subjects: schoolSubjects });
    setSchoolFrom("");
    setSchoolTo("");
    setSchoolSubjects([]);
  }

  function addExam() {
    if (!examValue) return setError("Choose an exam.");
    if (examSubjects.length === 0) return setError("Choose at least one subject.");
    addEntry({ track: "exam", classes: [examValue], subjects: examSubjects });
    setExamValue("");
    setExamSubjects([]);
  }

  function addSkill() {
    if (skillSubjects.length === 0) return setError("Choose at least one subject.");
    addEntry({ track: "skill", classes: [], subjects: skillSubjects });
    setSkillSubjects([]);
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.length > 0 && (
        <div>
          <span className="text-[15px] font-semibold text-ink">Your teaching list</span>
          <ul className="mt-1 flex flex-col gap-1.5">
            {entries.map((entry, i) => (
              <li
                key={`${entry.track}-${i}`}
                className="flex min-h-[54px] items-center justify-between gap-3 rounded-md border-[1.5px] border-line bg-white px-4 py-2 text-[14px] text-ink"
              >
                <span>{entrySummary(entry)}</span>
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="shrink-0 text-[14px] font-semibold text-danger underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-1.5 rounded-[14px] border-[1.5px] border-line bg-white p-1.5" role="tablist">
        {TABS.map(({ track, label }) => (
          <button
            key={track}
            type="button"
            role="tab"
            aria-selected={tab === track}
            onClick={() => {
              setTab(track);
              setError(null);
            }}
            className={`h-[46px] flex-1 rounded-[10px] px-2 text-[15px] font-bold ${
              tab === track ? "bg-blue-700 text-white" : "text-blue-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-[16px] bg-bg p-4">
        <h3 className="text-[15px] font-bold text-ink">Add to teaching list</h3>

        {tab === "school" && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[14px] text-ink-2">From class</span>
                <select value={schoolFrom} onChange={(e) => setSchoolFrom(e.target.value)} className={selectClass}>
                  <option value="">Choose</option>
                  {SCHOOL_CLASSES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[14px] text-ink-2">To class</span>
                <select value={schoolTo} onChange={(e) => setSchoolTo(e.target.value)} className={selectClass}>
                  <option value="">Choose</option>
                  {SCHOOL_CLASSES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SCHOOL_SUBJECTS.map((o) => (
                <OptionBox
                  key={o.value}
                  type="checkbox"
                  name="school-subjects"
                  value={o.value}
                  label={o.label}
                  checked={schoolSubjects.includes(o.value)}
                  onChange={(checked) => setSchoolSubjects((s) => toggleValue(s, o.value, checked))}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addSchool}
              className="h-[46px] rounded-md border-[1.5px] border-line bg-white text-[14px] font-bold text-blue-700"
            >
              Add to teaching list
            </button>
          </div>
        )}

        {tab === "exam" && (
          <div className="mt-3 flex flex-col gap-3">
            <label className="block">
              <span className="text-[14px] text-ink-2">Exam</span>
              <select value={examValue} onChange={(e) => setExamValue(e.target.value)} className={selectClass}>
                <option value="">Choose an exam</option>
                {EXAM_CLASSES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXAM_SUBJECTS.map((o) => (
                <OptionBox
                  key={o.value}
                  type="checkbox"
                  name="exam-subjects"
                  value={o.value}
                  label={o.label}
                  checked={examSubjects.includes(o.value)}
                  onChange={(checked) => setExamSubjects((s) => toggleValue(s, o.value, checked))}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addExam}
              className="h-[46px] rounded-md border-[1.5px] border-line bg-white text-[14px] font-bold text-blue-700"
            >
              Add to teaching list
            </button>
          </div>
        )}

        {tab === "skill" && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {SKILL_SUBJECTS.map((o) => (
                <OptionBox
                  key={o.value}
                  type="checkbox"
                  name="skill-subjects"
                  value={o.value}
                  label={o.label}
                  checked={skillSubjects.includes(o.value)}
                  onChange={(checked) => setSkillSubjects((s) => toggleValue(s, o.value, checked))}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="h-[46px] rounded-md border-[1.5px] border-line bg-white text-[14px] font-bold text-blue-700"
            >
              Add to teaching list
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-[14px] text-danger">{error}</p>}
      </div>
    </div>
  );
}
