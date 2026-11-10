"use client";

import { useActionState, useState } from "react";
import TeachingList from "@/components/TeachingList";
import { AREAS, BOARDS, MODES } from "@/lib/config";
import { modeLabel, slugify } from "@/lib/format";
import type { TeachingEntry } from "@/lib/types";
import type { ListingFormErrors, ListingFormInput } from "@/lib/validation";

export type ListingFormState = {
  errors: ListingFormErrors;
  values: ListingFormInput;
  /** A problem that isn't tied to one field, e.g. "tick consent before publishing". */
  formError?: string;
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

/** design.md §10: checkbox groups use <fieldset> + <legend>, not a <label> around several inputs. */
function FieldsetGroup({
  legend,
  error,
  children,
}: {
  legend: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="m-0 block border-0 p-0">
      <legend className="block p-0 text-[15px] font-medium text-ink">{legend}</legend>
      {children}
      {error && <span className="mt-1 block text-[14px] text-danger">{error}</span>}
    </fieldset>
  );
}

function CheckboxOption({
  name,
  value,
  label,
  defaultChecked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
  /** Optional: only Mode wires this up, to track which modes are ticked for the serves_areas reveal. */
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-md border border-rule px-2 text-[15px] text-ink">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="h-5 w-5"
      />
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
  const { values, errors, formError } = state;
  const [consentChecked, setConsentChecked] = useState(consentAt !== null);

  // app_flow.md A3: slug is prefilled from the name as it's typed, until the admin edits it directly.
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit" || values.slug !== "");

  // P8.2's shared component (also used by /join); kept in state and submitted via a hidden
  // JSON input since FormData can't carry nested arrays of objects natively.
  const [teachingEntries, setTeachingEntries] = useState<TeachingEntry[]>(values.teaching_entries);
  // Tracked separately from the native "modes" checkboxes below (which still submit
  // normally via FormData) only so "Villages I can travel to" can show/hide live.
  const [watchedModes, setWatchedModes] = useState<string[]>(values.modes);

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
          onChange={(e) => {
            if (mode === "new" && !slugTouched) setSlug(slugify(e.target.value));
          }}
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

      <FieldsetGroup legend="Teaching list" error={errors.teaching_entries}>
        <input type="hidden" name="teaching_entries" value={JSON.stringify(teachingEntries)} />
        <div className="mt-1">
          <TeachingList entries={teachingEntries} onChange={setTeachingEntries} />
        </div>
      </FieldsetGroup>

      <FieldsetGroup legend="Boards" error={errors.boards}>
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
      </FieldsetGroup>

      <FieldsetGroup legend="Mode" error={errors.modes}>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <CheckboxOption
              key={m}
              name="modes"
              value={m}
              label={modeLabel(m)}
              defaultChecked={values.modes.includes(m)}
              onChange={(checked) =>
                setWatchedModes((current) => (checked ? [...current, m] : current.filter((x) => x !== m)))
              }
            />
          ))}
        </div>
      </FieldsetGroup>

      <Field label="Area" error={errors.area}>
        <select name="area" defaultValue={values.area} className={`${inputBase} ${fieldBorder(!!errors.area)}`}>
          <option value="">Choose an area</option>
          {AREAS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      {watchedModes.includes("home") && (
        <FieldsetGroup legend="Villages I can travel to" error={errors.serves_areas}>
          <div className="mt-1 flex flex-col gap-3">
            {AREAS.map((group) => (
              <div key={group.group}>
                <p className="mb-1 text-[13px] text-ink-3">{group.group}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((option) => (
                    <CheckboxOption
                      key={option.value}
                      name="serves_areas"
                      value={option.value}
                      label={option.label}
                      defaultChecked={values.serves_areas.includes(option.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FieldsetGroup>
      )}

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
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
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

      {formError && <p className="text-[14px] text-danger">{formError}</p>}

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
