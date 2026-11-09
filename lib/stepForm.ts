/**
 * Shared building blocks for the multi-step forms (/request Phase 7, /join Phase 8).
 * design.md §11: one step per screen, reachable at ?step=N, draft kept in localStorage
 * wrapped in try/catch so a refresh — or a storage failure — never blocks the form.
 * Pure and framework-free so it can be unit tested without a browser (rules.md §3: no
 * extra packages like jsdom).
 */

export type StepDraftStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

/** Reads a saved draft. Returns {} on a missing key, invalid JSON, or storage that throws. */
export function loadDraft<T extends object>(storage: StepDraftStorage, key: string): Partial<T> {
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Partial<T>) : {};
  } catch {
    return {};
  }
}

/** Saves a draft. Does nothing if storage is full or unavailable (e.g. private browsing). */
export function saveDraft<T extends object>(storage: StepDraftStorage, key: string, draft: Partial<T>): void {
  try {
    storage.setItem(key, JSON.stringify(draft));
  } catch {
    // ignore — the form still works, just without persistence
  }
}

/** Clears a draft once the form has been sent. */
export function clearDraft(storage: StepDraftStorage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Clamps a `?step=` URL param to a valid 1-based step number; anything else is step 1. */
export function parseStep(raw: string | string[] | undefined, totalSteps: number): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return Math.min(n, totalSteps);
}
