"use client";

import { useEffect, useRef, useState } from "react";
import { clearDraft, loadDraft, saveDraft, type StepDraftStorage } from "./stepForm";

function browserStorage(): StepDraftStorage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/**
 * Keeps a multi-step form's answers in `localStorage` under `key`, restored on mount.
 * design.md §11: persistence failures (private browsing, storage full) are swallowed
 * inside lib/stepForm.ts, so they never block the form.
 */
export function useStepDraft<T extends object>(key: string, initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const loadedRef = useRef(false);

  useEffect(() => {
    const storage = browserStorage();
    if (storage) setDraft((current) => ({ ...current, ...loadDraft<T>(storage, key) }));
    loadedRef.current = true;
  }, [key]);

  useEffect(() => {
    if (!loadedRef.current) return;
    const storage = browserStorage();
    if (storage) saveDraft(storage, key, draft);
  }, [draft, key]);

  function clear() {
    const storage = browserStorage();
    if (storage) clearDraft(storage, key);
  }

  return { draft, setDraft, clear };
}
