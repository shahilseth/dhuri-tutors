"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseStep } from "@/lib/stepForm";
import type { RequestDraft } from "@/lib/types";
import { useStepDraft } from "@/lib/useStepDraft";
import RequestStepWhat from "./RequestStepWhat";
import RequestStepWhereWhen from "./RequestStepWhereWhen";
import StepBar from "./StepBar";
import StepFormLayout from "./StepFormLayout";
import WhatsNextBox from "./WhatsNextBox";

const STEP_LABELS = ["What", "Where and when", "Your details", "Send"];
// Raised to 3, then 4 as P7.6–P7.7 land. A later ?step= than this falls back to the last built step.
const BUILT_STEPS = 2;

const emptyDraft: RequestDraft = {
  class: "",
  subjects: [],
  all_subjects: false,
  board: "",
  mode: "",
  area: "",
  area_other: "",
  timings: [],
  budget_min: "",
  budget_max: "",
  is_adult: "",
  name: "",
  student_name: "",
  phone: "",
  notes: "",
  consent: false,
};

const WHATS_NEXT_POINTS = [
  "We send your request straight to the Dhuri Tutors admin on WhatsApp.",
  "We match it to teachers who teach that class, subject and area.",
  "You'll hear back on WhatsApp within 24 hours.",
];

export default function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setDraft } = useStepDraft<RequestDraft>("dhuri-request-draft", emptyDraft);

  const requestedStep = parseStep(searchParams.get("step") ?? undefined, STEP_LABELS.length);
  const step = Math.min(requestedStep, BUILT_STEPS);

  const goToStep = useCallback((n: number) => router.push(`/request?step=${n}`), [router]);

  return (
    <StepFormLayout whatsNext={<WhatsNextBox points={WHATS_NEXT_POINTS} />}>
      <h1 className="text-[22px] font-bold leading-[28px] text-ink">Tell us what you need</h1>
      <p className="mt-2 text-[15px] leading-[22px] text-ink-2">
        We&apos;ll pass this on to matching teachers on WhatsApp.
      </p>

      <div className="mt-6">
        <StepBar steps={STEP_LABELS} current={step} />
      </div>

      <div className="mt-6">
        {step === 1 && <RequestStepWhat draft={draft} setDraft={setDraft} onContinue={() => goToStep(2)} />}
        {step === 2 && (
          <RequestStepWhereWhen
            draft={draft}
            setDraft={setDraft}
            backHref="/request?step=1"
            onContinue={() => goToStep(3)}
          />
        )}
      </div>
    </StepFormLayout>
  );
}
