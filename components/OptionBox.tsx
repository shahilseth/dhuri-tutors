/**
 * Bordered option box for radios/checkboxes (design.md §6 "Option boxes"): 54px min height,
 * selected = blue-600 border + tint background. Controlled only — the multi-step forms keep
 * every answer in a step draft object rather than relying on uncontrolled defaultChecked.
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
      className={`flex min-h-[54px] items-center gap-2 rounded-md border-[1.5px] px-4 text-[16px] font-semibold text-ink transition-colors ${
        checked ? "border-blue-600 bg-tint" : "border-line bg-white"
      }`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-blue-700"
      />
      {label}
    </label>
  );
}
