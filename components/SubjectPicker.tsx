"use client";

import { useState } from "react";
import type { ConfigOption } from "@/lib/config";
import { subjectLabel } from "@/lib/format";
import ChipToggle from "./ChipToggle";

const MAX_MATCHES = 8;

/**
 * Search-as-you-type subject picker (design.md §6 "Search-as-you-type (subjects)"): chosen
 * subjects show as removable tags above the input; typing filters a list of clickable chips
 * below it — no checkboxes. `pool` is the allowed subject list (e.g. the union of subjects
 * for the classes a teacher just picked), so it narrows as that selection changes.
 */
export default function SubjectPicker({
  pool,
  selected,
  onChange,
  placeholder = "Type to search subjects, e.g. Maths",
  emptyHint,
}: {
  pool: ConfigOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState("");

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  if (pool.length === 0) {
    return emptyHint ? <p className="text-[14px] text-ink-3">{emptyHint}</p> : null;
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filtered = pool.filter((o) => o.label.toLowerCase().includes(trimmedQuery));
  // The cap only applies once the teacher is actually searching — with an empty query, the
  // whole (already class-narrowed) pool should stay pickable, not just its first 8 entries.
  const matches = trimmedQuery ? filtered.slice(0, MAX_MATCHES) : filtered;

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              aria-label={`Remove ${subjectLabel(value)}`}
              className="flex items-center gap-1 rounded-sm bg-tint px-2.5 py-1 text-[13px] font-semibold text-blue-700"
            >
              {subjectLabel(value)}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="block h-[54px] w-full rounded-md border-[1.5px] border-line bg-white px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15"
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {matches.map((o) => (
          <ChipToggle key={o.value} label={o.label} selected={selected.includes(o.value)} onClick={() => toggle(o.value)} />
        ))}
        {matches.length === 0 && (
          <p className="text-[14px] text-ink-2">No subjects match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}
