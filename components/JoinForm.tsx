"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseStep } from "@/lib/stepForm";
import type { JoinDraft } from "@/lib/types";
import { useStepDraft } from "@/lib/useStepDraft";
import JoinStepAboutYou from "./JoinStepAboutYou";
import JoinStepProfile from "./JoinStepProfile";
import JoinStepReview from "./JoinStepReview";
import JoinStepTeaching from "./JoinStepTeaching";
import StepBar from "./StepBar";
import StepFormLayout from "./StepFormLayout";
import WhatsNextBox from "./WhatsNextBox";

const STEP_LABELS = ["About you", "Teaching", "Profile", "Review", "Send"];
// Raised as each step lands (same incremental pattern RequestForm.tsx used in Phase 7).
const BUILT_STEPS = 4;

const emptyDraft: JoinDraft = {
  kind: "",
  name: "",
  academy_name: "",
  phone: "",
  whatsapp: "",
  area: "",
  area_other: "",
  address: "",
  teaching_entries: [],
  boards: [],
  modes: [],
  serves_areas: [],
  experience_years: "",
  qualification_level: "",
  qualification: "",
  languages: [],
  fee_min: "",
  fee_max: "",
  fee_note: "",
  timings: "",
  headline: "",
  about: "",
  consent: false,
  ref_code: "",
  whatsapp_url: "",
};

const WHATS_NEXT_POINTS = [
  "We check your details and publish your page.",
  "You'll get your public page link, a QR code and a private edit link on WhatsApp.",
  "We'll check your details and publish your page within 2 days.",
];

export default function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setDraft } = useStepDraft<JoinDraft>("dhuri-join-draft", emptyDraft);

  const requestedStep = parseStep(searchParams.get("step") ?? undefined, STEP_LABELS.length);
  const step = Math.min(requestedStep, BUILT_STEPS);

  const goToStep = useCallback((n: number) => router.push(`/join?step=${n}`), [router]);

  return (
    <StepFormLayout whatsNext={<WhatsNextBox points={WHATS_NEXT_POINTS} />}>
      <h1 className="text-[22px] font-bold leading-[28px] text-ink">List yourself on Dhuri Tutors</h1>
      <p className="mt-2 text-[15px] leading-[22px] text-ink-2">It takes about 10 minutes. No account needed.</p>

      <div className="mt-6">
        <StepBar steps={STEP_LABELS} current={step} />
      </div>

      <div className="mt-6">
        {step === 1 && <JoinStepAboutYou draft={draft} setDraft={setDraft} onContinue={() => goToStep(2)} />}
        {step === 2 && (
          <JoinStepTeaching
            draft={draft}
            setDraft={setDraft}
            backHref="/join?step=1"
            onContinue={() => goToStep(3)}
          />
        )}
        {step === 3 && (
          <JoinStepProfile draft={draft} setDraft={setDraft} backHref="/join?step=2" onContinue={() => goToStep(4)} />
        )}
        {step === 4 && (
          <JoinStepReview draft={draft} setDraft={setDraft} backHref="/join?step=3" onContinue={() => goToStep(5)} />
        )}
      </div>
    </StepFormLayout>
  );
}
