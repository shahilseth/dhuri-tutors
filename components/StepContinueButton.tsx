/** design.md §6 "Buttons": Continue is a Primary button; the save note sits directly under it. */
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
        className="h-[54px] rounded-md bg-gradient-to-b from-blue-600 to-blue-700 text-[16px] font-bold text-white shadow-btn active:from-blue-800 active:to-blue-800 active:shadow-none disabled:bg-none disabled:bg-tint-2 disabled:text-ink-3 disabled:shadow-none"
      >
        {pending ? "Saving…" : label}
      </button>
      <p className="text-center text-[13px] text-ink-3">Your progress is saved on this phone.</p>
    </div>
  );
}
