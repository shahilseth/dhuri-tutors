/**
 * Bordered option box for radios/checkboxes (design.md §11): ≥48px tall, selected = blue
 * border + blue-tint background. Controlled only — the multi-step forms keep every
 * answer in a step draft object rather than relying on uncontrolled defaultChecked.
 */
export default function OptionBox({
  type,
  name,
  value,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex min-h-12 items-center gap-2 rounded-md border px-3 text-[16px] text-ink ${
        checked ? "border-2 border-blue bg-blue-tint" : "border border-rule bg-paper"
      }`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
      {label}
    </label>
  );
}
