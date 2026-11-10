"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseStep } from "@/lib/stepForm";
import type { RequestDraft } from "@/lib/types";
import { useStepDraft } from "@/lib/useStepDraft";
import RequestStepSend from "./RequestStepSend";
import RequestStepWhat from "./RequestStepWhat";
import RequestStepWhereWhen from "./RequestStepWhereWhen";
import RequestStepYourDetails from "./RequestStepYourDetails";
import StepBar from "./StepBar";
import StepFormLayout from "./StepFormLayout";
import WhatsNextBox from "./WhatsNextBox";

const STEP_LABELS = ["What", "Where and when", "Your details", "Send"];
const BUILT_STEPS = 4;
// design.md §6 "Eyebrow + title block": per-step title for /request.
const STEP_TITLES = [
  "Tell us what your child needs",
  "Where and when",
  "Your details",
  "Send your request",
];

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
  ref_code: "",
  whatsapp_url: "",
};

const WHATS_NEXT_POINTS = [
  "We send your request straight to the Dhuri Tutors admin on WhatsApp.",
  "We match it to teachers who teach that class, subject and area.",
  "You'll hear back on WhatsApp within 24 hours.",
];

export default function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setDraft, loaded } = useStepDraft<RequestDraft>("dhuri-request-draft", emptyDraft);

  const requestedStep = parseStep(searchParams.get("step") ?? undefined, STEP_LABELS.length);
  const step = Math.min(requestedStep, BUILT_STEPS);

  const goToStep = useCallback((n: number) => router.push(`/request?step=${n}`), [router]);

  return (
    <StepFormLayout whatsNext={<WhatsNextBox points={WHATS_NEXT_POINTS} />}>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
        Find the right teacher
      </p>
      <h1 className="mt-2.5 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
        {STEP_TITLES[step - 1]}
      </h1>
      <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.55] text-ink-2">
        We&apos;ll pass this on to matching teachers on WhatsApp.
      </p>

      <div className="mt-7">
        <StepBar steps={STEP_LABELS} current={step} />
      </div>

      <div className="mt-7 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-9">
        {step === 1 && <RequestStepWhat draft={draft} setDraft={setDraft} onContinue={() => goToStep(2)} />}
        {step === 2 && (
          <RequestStepWhereWhen
            draft={draft}
            setDraft={setDraft}
            backHref="/request?step=1"
            onContinue={() => goToStep(3)}
          />
        )}
        {step === 3 && (
          <RequestStepYourDetails
            draft={draft}
            setDraft={setDraft}
            backHref="/request?step=2"
            onContinue={() => goToStep(4)}
          />
        )}
        {step === 4 && (
          <RequestStepSend draft={draft} setDraft={setDraft} loaded={loaded} backHref="/request?step=3" />
        )}
      </div>
    </StepFormLayout>
  );
}
