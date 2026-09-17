import type { ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/** Label + control + error wiring (aria-describedby) for every form input. */
export function Field({ id, label, error, hint, required, children }: Props) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="space-y-1.5" data-described-by={describedBy || undefined}>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {label}
        {required ? "" : <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "block w-full rounded-md border border-line bg-white px-3.5 py-3 text-base text-slate placeholder:text-muted focus:border-navy";
