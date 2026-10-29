"use client";

import { useActionState, useState } from "react";
import { AREAS, BOARDS, CLASSES, MODES, SUBJECTS } from "@/lib/config";
import { modeLabel } from "@/lib/format";
import type { ListingFormErrors, ListingFormInput } from "@/lib/validation";

export type ListingFormState = {
  errors: ListingFormErrors;
  values: ListingFormInput;
};

const inputBase =
  "mt-1 block h-12 w-full rounded-md border px-3 text-[16px] text-ink focus:outline-none focus:ring-2 focus:ring-blue/25";

function fieldBorder(hasError: boolean): string {
  return hasError ? "border-danger" : "border-rule focus:border-blue";
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[15px] font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[14px] text-danger">{error}</span>}
    </label>
  );
}

function CheckboxOption({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-md border border-rule px-2 text-[15px] text-ink">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="h-5 w-5" />
      {label}
    </label>
  );
}

function formatConsentDate(consentAt: string): string {
  return new Date(consentAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ListingForm({
  formAction,
  initialValues,
  consentAt,
  mode,
}: {
  formAction: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  initialValues: ListingFormInput;
  consentAt: string | null;
  mode: "new" | "edit";
}) {
  const [state, action, pending] = useActionState(formAction, { errors: {}, values: initialValues });
  const { values, errors } = state;
  const [consentChecked, setConsentChecked] = useState(consentAt !== null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Type" error={errors.kind}>
        <select name="kind" defaultValue={values.kind} className={`${inputBase} ${fieldBorder(!!errors.kind)}`}>
          <option value="teacher">Teacher</option>
          <option value="academy">Academy</option>
        </select>
      </Field>

      <Field label="Name" error={errors.name}>
        <input
          type="text"
          name="name"
          defaultValue={values.name}
          className={`${inputBase} ${fieldBorder(!!errors.name)}`}
        />
      </Field>

      <Field label="Contact person" error={errors.contact_person}>
        <input
          type="text"
          name="contact_person"
          defaultValue={values.contact_person}
          className={`${inputBase} ${fieldBorder(!!errors.contact_person)}`}
        />
      </Field>

      <Field label="Phone" error={errors.phone}>
        <input
          type="tel"
          name="phone"
          defaultValue={values.phone}
          className={`${inputBase} ${fieldBorder(!!errors.phone)}`}
        />
      </Field>

      <Field label="WhatsApp (if different)" error={errors.whatsapp}>
        <input
          type="tel"
          name="whatsapp"
          defaultValue={values.whatsapp}
          className={`${inputBase} ${fieldBorder(!!errors.whatsapp)}`}
        />
      </Field>

      <Field label="Subjects" error={errors.subjects}>
        <div className="mt-1 flex flex-col gap-3">
          {SUBJECTS.map((group) => (
            <div key={group.group}>
              <p className="mb-1 text-[13px] text-ink-3">{group.group}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => (
                  <CheckboxOption
                    key={option.value}
                    name="subjects"
                    value={option.value}
                    label={option.label}
                    defaultChecked={values.subjects.includes(option.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Classes" error={errors.classes}>
        <div className="mt-1 flex flex-col gap-3">
          {CLASSES.map((group) => (
            <div key={group.group}>
              <p className="mb-1 text-[13px] text-ink-3">{group.group}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => (
                  <CheckboxOption
                    key={option.value}
                    name="classes"
                    value={option.value}
                    label={option.label}
                    defaultChecked={values.classes.includes(option.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Boards" error={errors.boards}>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {BOARDS.map((board) => (
            <CheckboxOption
              key={board}
              name="boards"
              value={board}
              label={board}
              defaultChecked={values.boards.includes(board)}
            />
          ))}
        </div>
      </Field>

      <Field label="Mode" error={errors.modes}>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <CheckboxOption
              key={m}
              name="modes"
              value={m}
              label={modeLabel(m)}
              defaultChecked={values.modes.includes(m)}
            />
          ))}
        </div>
      </Field>

      <Field label="Area" error={errors.area}>
        <select name="area" defaultValue={values.area} className={`${inputBase} ${fieldBorder(!!errors.area)}`}>
          <option value="">Choose an area</option>
          {AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Address / landmark" error={errors.address}>
        <input
          type="text"
          name="address"
          defaultValue={values.address}
          className={`${inputBase} ${fieldBorder(!!errors.address)}`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fee min (₹/month)" error={errors.fee_min}>
          <input
            type="number"
            name="fee_min"
            min={0}
            max={100000}
            defaultValue={values.fee_min}
            className={`${inputBase} ${fieldBorder(!!errors.fee_min)}`}
          />
        </Field>
        <Field label="Fee max (₹/month)" error={errors.fee_max}>
          <input
            type="number"
            name="fee_max"
            min={0}
            max={100000}
            defaultValue={values.fee_max}
            className={`${inputBase} ${fieldBorder(!!errors.fee_max)}`}
          />
        </Field>
      </div>

      <Field label="Fee note" error={errors.fee_note}>
        <input
          type="text"
          name="fee_note"
          placeholder="e.g. per subject"
          defaultValue={values.fee_note}
          className={`${inputBase} ${fieldBorder(!!errors.fee_note)}`}
        />
      </Field>

      <Field label="Timings" error={errors.timings}>
        <input
          type="text"
          name="timings"
          placeholder="e.g. Mon to Sat, 4 to 8 pm"
          defaultValue={values.timings}
          className={`${inputBase} ${fieldBorder(!!errors.timings)}`}
        />
      </Field>

      <Field label="About" error={errors.about}>
        <textarea
          name="about"
          rows={4}
          defaultValue={values.about}
          className={`${inputBase} h-auto py-2 ${fieldBorder(!!errors.about)}`}
        />
      </Field>

      <Field label="Link (slug)" error={errors.slug}>
        <input
          type="text"
          name="slug"
          defaultValue={values.slug}
          className={`${inputBase} ${fieldBorder(!!errors.slug)}`}
        />
      </Field>

      <label
        className={`flex items-start gap-2 rounded-md border border-rule p-3 ${
          consentChecked ? "" : "bg-amber-tint"
        }`}
      >
        <input
          type="checkbox"
          name="consent"
          value="yes"
          defaultChecked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5 h-5 w-5"
        />
        {consentAt ? (
          <span className="text-[15px] text-ink-2">Consent recorded on {formatConsentDate(consentAt)}</span>
        ) : (
          <span className="text-[15px] text-ink">The teacher agreed to be listed on this site.</span>
        )}
      </label>

      <div className="flex flex-col gap-3">
        {mode === "new" ? (
          <>
            <button
              type="submit"
              name="intent"
              value="hidden"
              disabled={pending}
              className="h-12 rounded-md border border-rule bg-paper text-[16px] font-semibold text-blue disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save as hidden"}
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending}
              className="h-12 rounded-md bg-blue text-[16px] font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save and publish"}
            </button>
          </>
        ) : (
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className="h-12 rounded-md bg-blue text-[16px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        )}
      </div>
    </form>
  );
}
