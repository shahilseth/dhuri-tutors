"use client";

import { useState } from "react";
import { CLASSES, SUBJECTS, subjectsForClasses } from "@/lib/config";
import { classesText, subjectLabel } from "@/lib/format";
import type { TeachingEntry, TeachingTrack } from "@/lib/types";
import ChipToggle from "./ChipToggle";
import SubjectPicker from "./SubjectPicker";

// "College" (bcom/ba/bsc/bca/other-college) isn't offered here: teaching_entries.track is
// constrained to school/exam/skill (migration 0002), owner-confirmed 2026-11-10 — see
// tracker.md Blockers. Only the three groups below are reachable from this component.
const SCHOOL_CLASSES = CLASSES.find((g) => g.group === "School")!.options;
const EXAM_CLASSES = CLASSES.find((g) => g.group === "Entrance and competitive exams")!.options;
const EXAM_PREP_SUBJECTS = SUBJECTS.find((g) => g.group === "Exam preparation")!.options;
const SKILL_SUBJECTS = SUBJECTS.find((g) => g.group === "Skills and extra classes")!.options;

const TABS: { track: TeachingTrack; label: string }[] = [
  { track: "school", label: "School" },
  { track: "exam", label: "Entrance and competitive exams" },
  { track: "skill", label: "Skills and activities" },
];

function entrySummary(entry: TeachingEntry): string {
  const subjects = entry.subjects.map(subjectLabel).join(", ") || "No subjects";
  if (entry.track === "skill") return `Skills: ${subjects}`;
  if (entry.track === "exam") return `Exam: ${classesText(entry.classes)} — ${subjects}`;
  return `School: ${classesText(entry.classes)} — ${subjects}`;
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Shared "add to teaching list" component (app_flow.md J2; schema.md §3 `teaching_entries`).
 * Used by /join (P8.3) and the admin listing form (P8.8). Each tab keeps its own unfinished
 * selection in local state so switching tabs doesn't lose it — only finished entries live in
 * the `entries` prop, which is what's persisted (draft localStorage, or the admin form state).
 *
 * Classes and exams are both any combination the teacher picks (e.g. Class 1 to 8, or Class
 * 9 and 11 without 10) rather than a forced contiguous range or a single exam — `classes` is
 * already a plain array column (schema.md §3), so this is a UI choice, not a schema change.
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

  const [schoolClasses, setSchoolClasses] = useState<string[]>([]);
  const [schoolSubjects, setSchoolSubjects] = useState<string[]>([]);

  const [examClasses, setExamClasses] = useState<string[]>([]);
  const [examSubjects, setExamSubjects] = useState<string[]>([]);

  const [skillSubjects, setSkillSubjects] = useState<string[]>([]);

  // Narrows live as classes are (de)selected — e.g. picking Class 1 to 8 offers Maths/English/
  // Science/... but not Physics/Economics, which only show once an 11 or 12 is picked too.
  const schoolSubjectPool = subjectsForClasses(schoolClasses);
  // Exam-track subjects cover both academic exams (JEE/NEET need Physics, Maths, ...) and
  // non-academic ones (SSC/Banking/Police need Reasoning, GK, ...), so the pool is every
  // school subject plus exam-prep subjects, regardless of which exam(s) are picked.
  const examSubjectPool = [...subjectsForClasses(SCHOOL_CLASSES.map((o) => o.value)), ...EXAM_PREP_SUBJECTS];

  function addEntry(entry: TeachingEntry) {
    onChange([...entries, entry]);
    setError(null);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function toggleSchoolClass(value: string) {
    setSchoolClasses((current) => {
      const next = toggleValue(current, value);
      const pool = new Set(subjectsForClasses(next).map((o) => o.value));
      setSchoolSubjects((subjects) => subjects.filter((s) => pool.has(s)));
      return next;
    });
  }

  function addSchool() {
    if (schoolClasses.length === 0) return setError("Choose at least one class.");
    if (schoolSubjects.length === 0) return setError("Choose at least one subject.");
    const orderedClasses = SCHOOL_CLASSES.filter((o) => schoolClasses.includes(o.value)).map((o) => o.value);
    addEntry({ track: "school", classes: orderedClasses, subjects: schoolSubjects });
    setSchoolClasses([]);
    setSchoolSubjects([]);
  }

  function addExam() {
    if (examClasses.length === 0) return setError("Choose at least one exam.");
    if (examSubjects.length === 0) return setError("Choose at least one subject.");
    const orderedExams = EXAM_CLASSES.filter((o) => examClasses.includes(o.value)).map((o) => o.value);
    addEntry({ track: "exam", classes: orderedExams, subjects: examSubjects });
    setExamClasses([]);
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
            <div>
              <span className="text-[14px] text-ink-2">
                Classes — pick any combination, e.g. Class 1 to 8, or just 9 and 11
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SCHOOL_CLASSES.map((o) => (
                  <ChipToggle
                    key={o.value}
                    label={o.label}
                    selected={schoolClasses.includes(o.value)}
                    onClick={() => toggleSchoolClass(o.value)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-[14px] text-ink-2">Subjects</span>
              <div className="mt-1.5">
                <SubjectPicker
                  pool={schoolSubjectPool}
                  selected={schoolSubjects}
                  onChange={setSchoolSubjects}
                  emptyHint="Choose at least one class above to see the subjects taught there."
                />
              </div>
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
            <div>
              <span className="text-[14px] text-ink-2">Exams — pick as many as you teach for</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {EXAM_CLASSES.map((o) => (
                  <ChipToggle
                    key={o.value}
                    label={o.label}
                    selected={examClasses.includes(o.value)}
                    onClick={() => setExamClasses((current) => toggleValue(current, o.value))}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-[14px] text-ink-2">Subjects</span>
              <div className="mt-1.5">
                <SubjectPicker pool={examSubjectPool} selected={examSubjects} onChange={setExamSubjects} />
              </div>
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
            <SubjectPicker pool={SKILL_SUBJECTS} selected={skillSubjects} onChange={setSkillSubjects} />
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
