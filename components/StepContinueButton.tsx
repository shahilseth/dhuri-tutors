/** design.md §11: "Continue" is a Primary button; the save note sits directly under it. */
export default function StepContinueButton({
  label = "Continue",
  pending = false,
}: {
  label?: string;
  pending?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-md bg-blue text-[16px] font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : label}
      </button>
      <p className="text-center text-[13px] text-ink-3">Your progress is saved on this phone.</p>
    </div>
  );
}
