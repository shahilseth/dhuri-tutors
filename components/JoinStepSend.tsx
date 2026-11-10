"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createSignupAction } from "@/app/join/actions";
import type { JoinDraft } from "@/lib/types";
import StepBackLink from "./StepBackLink";

/** app_flow.md J5 "Send": saves on reaching the step, then the WhatsApp button. */
export default function JoinStepSend({
  draft,
  setDraft,
  loaded,
  backHref,
}: {
  draft: JoinDraft;
  setDraft: (updater: (d: JoinDraft) => JoinDraft) => void;
  /** From useStepDraft: true once the saved draft (if any) has been read back from localStorage. */
  loaded: boolean;
  backHref: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    // Waits for `loaded`, same reason RequestStepSend.tsx does: on a direct/reloaded visit
    // to step 5, the parent's own draft hasn't been read back from localStorage yet on this
    // component's first render, so `draft` here would otherwise still be the empty starting value.
    if (!loaded || started.current) return;
    if (draft.ref_code) {
      setSaving(false);
      return;
    }
    started.current = true;
    createSignupAction(draft)
      .then((result) => {
        if (result.ok) {
          setDraft((d) => ({ ...d, ref_code: result.refCode, whatsapp_url: result.whatsappUrl }));
        } else {
          setError("Something in your answers doesn't look right. Please check each step and try again.");
        }
      })
      .catch(() => setError("Couldn't send your details. Please check your internet connection and try again."))
      .finally(() => setSaving(false));
    // Only `loaded` should re-trigger this: once it flips true, draft reflects the real
    // (possibly already-loaded) values and the sign-up must only be saved a single time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (saving) {
    return (
      <div className="flex flex-col gap-5">
        <StepBackLink href={backHref} />
        <p className="text-[15px] text-ink-2">Sending your details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <StepBackLink href={backHref} />
        <p className="text-[14px] text-danger">{error}</p>
        <Link href="/join?step=1" className="text-[15px] text-blue underline">
          Start from step 1
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <StepBackLink href={backHref} />

      <p className="text-[15px] font-medium text-ink">
        Sign-up sent — reference <span className="font-semibold">{draft.ref_code}</span>
      </p>

      <p className="text-[15px] text-ink-2">We&apos;ll check your details and publish your page within 2 days.</p>

      <a
        href={draft.whatsapp_url}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center justify-center rounded-md bg-wa text-[16px] font-semibold text-white"
      >
        Send on WhatsApp
      </a>
    </div>
  );
}
