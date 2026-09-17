import type { ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/** Label above, control underlined, error beneath. No boxes. */
export function Field({ id, label, error, hint, required, children }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="marker block">
        {label}
        {!required && <span className="ml-2 normal-case tracking-normal">optional</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
