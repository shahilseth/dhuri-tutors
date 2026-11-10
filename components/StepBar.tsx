/** design.md §6 "Step bar": numbered circles with a 4px top bar, filled blue-700 for current/done steps. */
export default function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const isCurrent = n === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                aria-hidden
                className={`h-1 flex-1 ${i === 0 ? "invisible" : n <= current ? "bg-blue-600" : "bg-tint-2"}`}
              />
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                  done || isCurrent
                    ? "bg-blue-700 text-white"
                    : "bg-tint text-ink-3",
                  isCurrent ? "ring-4 ring-tint-2" : "",
                ].join(" ")}
              >
                {done ? "✓" : n}
              </span>
              <span
                aria-hidden
                className={`h-1 flex-1 ${i === steps.length - 1 ? "invisible" : n < current ? "bg-blue-600" : "bg-tint-2"}`}
              />
            </div>
            <span
              className={`mt-2 text-center text-[13px] ${
                isCurrent ? "font-semibold text-ink" : "text-ink-2"
              } ${isCurrent ? "" : "hidden sm:inline"}`}
            >
              {label}
            </span>
          </li>
        );
      })}
      <li className="sr-only sm:hidden">
        Step {current} of {steps.length}
      </li>
    </ol>
  );
}
