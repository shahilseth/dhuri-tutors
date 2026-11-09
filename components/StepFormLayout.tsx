/** design.md §11: the "What happens next" box sits under the form on phones, and in a right-hand column at ≥1024px. */
export default function StepFormLayout({
  children,
  whatsNext,
}: {
  children: React.ReactNode;
  whatsNext: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[42rem] px-4 py-6 lg:max-w-[64rem]">
      <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-8">
        <div>{children}</div>
        <div className="mt-6 lg:mt-0">{whatsNext}</div>
      </div>
    </div>
  );
}
