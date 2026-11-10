"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseStep } from "@/lib/stepForm";
import type { JoinDraft } from "@/lib/types";
import { useStepDraft } from "@/lib/useStepDraft";
import JoinStepAboutYou from "./JoinStepAboutYou";
import JoinStepProfile from "./JoinStepProfile";
import JoinStepReview from "./JoinStepReview";
import JoinStepSend from "./JoinStepSend";
import JoinStepTeaching from "./JoinStepTeaching";
import StepBar from "./StepBar";
import StepFormLayout from "./StepFormLayout";
import WhatsNextBox from "./WhatsNextBox";

const STEP_LABELS = ["About you", "Teaching", "Profile", "Review", "Send"];
// design.md §6 "Eyebrow + title block": per-step title for /join.
const STEP_TITLES = [
  "Tell us about yourself",
  "What and how do you teach?",
  "Add your teaching experience",
  "Check your page",
  "Send for approval",
];
// Raised as each step lands (same incremental pattern RequestForm.tsx used in Phase 7).
const BUILT_STEPS = 5;

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
  const { draft, setDraft, loaded } = useStepDraft<JoinDraft>("dhuri-join-draft", emptyDraft);

  const requestedStep = parseStep(searchParams.get("step") ?? undefined, STEP_LABELS.length);
  const step = Math.min(requestedStep, BUILT_STEPS);

  const goToStep = useCallback((n: number) => router.push(`/join?step=${n}`), [router]);

  return (
    <StepFormLayout whatsNext={<WhatsNextBox points={WHATS_NEXT_POINTS} />}>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
        Build your teacher profile
      </p>
      <h1 className="mt-2.5 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
        {STEP_TITLES[step - 1]}
      </h1>
      <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.55] text-ink-2">
        It takes about 10 minutes. No account needed.
      </p>

      <div className="mt-7">
        <StepBar steps={STEP_LABELS} current={step} />
      </div>

      <div className="mt-7 rounded-lg border border-line bg-white p-5 shadow-card md:rounded-xl md:p-9">
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
        {step === 5 && (
          <JoinStepSend draft={draft} setDraft={setDraft} loaded={loaded} backHref="/join?step=4" />
        )}
      </div>
    </StepFormLayout>
  );
}
