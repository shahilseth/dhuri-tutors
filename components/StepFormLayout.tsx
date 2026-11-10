/** design.md §6: the "What happens next" panel sits under the form on phones, sticky in a right-hand column at ≥1024px. */
export default function StepFormLayout({
  children,
  whatsNext,
}: {
  children: React.ReactNode;
  whatsNext: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[42rem] px-4 py-6 md:px-6 lg:max-w-[64rem] lg:px-10">
      <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-8">
        <div>{children}</div>
        <div className="mt-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">{whatsNext}</div>
      </div>
    </div>
  );
}
