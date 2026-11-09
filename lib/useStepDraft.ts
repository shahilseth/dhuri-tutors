"use client";

import { useEffect, useState } from "react";
import { clearDraft, loadDraft, saveDraft, type StepDraftStorage } from "./stepForm";

function browserStorage(): StepDraftStorage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/**
 * Keeps a multi-step form's answers in `localStorage` under `key`, restored on mount.
 * design.md §11: persistence failures (private browsing, storage full) are swallowed
 * inside lib/stepForm.ts, so they never block the form.
 *
 * `loaded` is state, not a ref: the load effect and the save effect both run in the same
 * pass on mount, in declaration order, but the save effect's closure still holds the
 * render's original `draft` (the merged value only lands on the *next* render). Gating on
 * a ref that the load effect flips synchronously let the save effect "pass" on that first
 * pass anyway and write the stale, empty `draft` straight back over what was just loaded.
 * Gating on state instead means the save effect only sees `loaded === true` once React has
 * re-rendered with the merged draft already in its own closure.
 */
export function useStepDraft<T extends object>(key: string, initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storage = browserStorage();
    if (storage) setDraft((current) => ({ ...current, ...loadDraft<T>(storage, key) }));
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    const storage = browserStorage();
    if (storage) saveDraft(storage, key, draft);
  }, [loaded, draft, key]);

  function clear() {
    const storage = browserStorage();
    if (storage) clearDraft(storage, key);
  }

  return { draft, setDraft, clear, loaded };
}
