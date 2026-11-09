/** design.md §11: numbered circles joined by a line, filled blue for completed steps. */
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
                className={`h-0.5 flex-1 ${i === 0 ? "invisible" : n <= current ? "bg-blue" : "bg-rule"}`}
              />
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold",
                  done
                    ? "border-blue bg-blue text-white"
                    : isCurrent
                      ? "border-blue bg-paper text-blue"
                      : "border-rule bg-paper text-ink-3",
                ].join(" ")}
              >
                {done ? "✓" : n}
              </span>
              <span
                aria-hidden
                className={`h-0.5 flex-1 ${i === steps.length - 1 ? "invisible" : n < current ? "bg-blue" : "bg-rule"}`}
              />
            </div>
            <span className={`mt-1 text-center text-[13px] ${isCurrent ? "font-semibold text-blue" : "text-ink-2"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
