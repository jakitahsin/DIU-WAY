"use client";

import { Check, GraduationCap, Plus, Sparkles, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Department } from "@/lib/types";
import { OTHER_DEPARTMENT, type ScheduleFormValues } from "@/lib/validation";
import { cn } from "@/lib/cn";

/** Mirrors the SQL normalize_department() so we can spot duplicates early. */
function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ProfileForm({ departments }: { departments: Department[] }) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<ScheduleFormValues>();
  const departmentId = useWatch({ control, name: "department_id" });
  const custom = useWatch({ control, name: "custom_department" });
  const [focused, setFocused] = useState(false);

  const preset = departments.filter((d) => !d.is_custom);
  const selectedCustom = departments.find((d) => d.is_custom && d.id === departmentId);
  const chips = selectedCustom ? [...preset, selectedCustom] : preset;
  const isOther = departmentId === OTHER_DEPARTMENT;

  const suggestions = useMemo(() => {
    const q = normalize(custom ?? "");
    if (!q) return departments.filter((d) => d.is_custom).slice(0, 8);
    return departments
      .filter((d) => normalize(d.name).includes(q) || (d.long_name && normalize(d.long_name).includes(q)))
      .slice(0, 8);
  }, [custom, departments]);

  const exact = useMemo(() => {
    const q = normalize(custom ?? "");
    return q
      ? departments.find((d) => normalize(d.name) === q || (d.long_name && normalize(d.long_name) === q))
      : undefined;
  }, [custom, departments]);

  function pick(id: string) {
    setValue("department_id", id, { shouldValidate: true, shouldDirty: true });
    if (id !== OTHER_DEPARTMENT) setValue("custom_department", "", { shouldDirty: true });
  }

  return (
    <section className="rounded-[2rem] border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="profile-title">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-navy text-lime dark:bg-lime dark:text-navy">
          <UserRound className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id="profile-title" className="font-display text-xl font-bold sm:text-2xl">
            About you
          </h2>
          <p className="text-sm text-muted">How your friends will see you on the board.</p>
        </div>
      </header>

      <div className="space-y-6">
        <div>
          <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-ink">
            Full name
          </label>
          <input
            id="full_name"
            autoComplete="name"
            placeholder="e.g. Jaki Tahsin"
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
            {...register("full_name")}
            className={cn(
              "h-12 w-full rounded-2xl border bg-surface px-4 text-base font-medium text-ink outline-none transition placeholder:text-muted focus:ring-4",
              errors.full_name
                ? "border-[#d9534f] focus:ring-[#d9534f]/15"
                : "border-line focus:border-brand focus:ring-brand/15",
            )}
          />
          {errors.full_name && (
            <p id="full_name-error" className="mt-1.5 text-sm font-medium text-[#c0392b]">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Department</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Department">
            {chips.map((d) => {
              const on = departmentId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(d.id)}
                  title={d.long_name ?? d.name}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-all duration-200 active:scale-95",
                    on
                      ? "border-brand bg-brand text-white shadow-card dark:text-[#06240f]"
                      : "border-line bg-surface text-ink-soft hover:border-brand/40 hover:text-ink",
                  )}
                >
                  {on ? <Check className="size-4" aria-hidden /> : <GraduationCap className="size-4 opacity-60" aria-hidden />}
                  {d.name}
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={isOther}
              onClick={() => pick(OTHER_DEPARTMENT)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-2xl border border-dashed px-4 text-sm font-semibold transition-all duration-200 active:scale-95",
                isOther
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-line text-ink-soft hover:border-brand/40 hover:text-ink",
              )}
            >
              <Plus className="size-4" aria-hidden /> Other department
            </button>
          </div>
          {errors.department_id && (
            <p className="mt-1.5 text-sm font-medium text-[#c0392b]">{errors.department_id.message}</p>
          )}

          {isOther && (
            <div className="relative mt-4 animate-rise">
              <label htmlFor="custom_department" className="mb-2 block text-sm font-medium text-ink-soft">
                Type your department — we&apos;ll match it to one friends already use
              </label>
              <input
                id="custom_department"
                placeholder="e.g. Civil Engineering, EEE, BBA…"
                autoComplete="off"
                aria-invalid={Boolean(errors.custom_department)}
                {...register("custom_department")}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  register("custom_department").onBlur(e);
                  setTimeout(() => setFocused(false), 150);
                }}
                className={cn(
                  "h-12 w-full rounded-2xl border bg-surface px-4 text-base font-medium text-ink outline-none transition placeholder:text-muted focus:ring-4",
                  errors.custom_department
                    ? "border-[#d9534f] focus:ring-[#d9534f]/15"
                    : "border-line focus:border-brand focus:ring-brand/15",
                )}
              />
              {errors.custom_department && (
                <p className="mt-1.5 text-sm font-medium text-[#c0392b]">{errors.custom_department.message}</p>
              )}

              {exact ? (
                <button
                  type="button"
                  onClick={() => pick(exact.id)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-lime-soft px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-lime"
                >
                  <Sparkles className="size-4 text-brand" aria-hidden /> “{exact.name}” already exists — tap to use it
                </button>
              ) : custom && custom.trim().length >= 2 ? (
                <p className="mt-3 text-sm text-muted">
                  New department <strong className="text-ink">“{custom.trim().replace(/\s+/g, " ")}”</strong> will be
                  added for everyone to pick.
                </p>
              ) : null}

              {focused && suggestions.length > 0 && !exact && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                    {custom ? "Did you mean" : "Added by friends"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(d.id)}
                        className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm font-medium text-ink hover:border-brand/40 hover:bg-brand-soft"
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </fieldset>
      </div>
    </section>
  );
}
