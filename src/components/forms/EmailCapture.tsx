"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { site } from "@/config/site";
import type { ServiceSlug } from "@/content/types";
import { subscribeSchema, fieldErrors } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { inputClass } from "@/components/ui/Field";
import { Honeypot } from "@/components/forms/Honeypot";
import { readAttributionCookie } from "@/lib/attribution";

interface Props {
  service: ServiceSlug;
  headline: string;
  buttonLabel: string;
}

/** The fixed one-line disclosure. Wording is part of the spec; do not edit casually. */
export const DISCLOSURE = "You'll get the full video plus a short daily marketing puzzle. Unsubscribe anytime.";

/**
 * Email field that unlocks the deep-dive video. This IS the newsletter opt-in
 * (no checkbox). Rendered only when the public phase is 2 or higher.
 */
export function EmailCapture({ service, headline, buttonLabel }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      email: String(fd.get("email") ?? ""),
      service,
      company_website: String(fd.get("company_website") ?? ""),
      started_at: String(fd.get("started_at") ?? ""),
      attribution: readAttributionCookie(document.cookie) ?? {},
    };
    const parsed = subscribeSchema.safeParse(raw);
    if (!parsed.success) {
      setError(fieldErrors(parsed.error).email ?? "Enter a valid email address.");
      setStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      if (res.status === 429) {
        setError(`Too many attempts. Try again later or email us at ${site.contactEmail}.`);
        setStatus("error");
        return;
      }
      const json = (await res.json().catch(() => null)) as { ok: true; redirectTo: string } | null;
      if (!res.ok || !json?.ok) {
        setError(`Something went wrong. Email us at ${site.contactEmail}.`);
        setStatus("error");
        return;
      }
      track("subscribe", { service });
      setStatus("done");
      router.push(json.redirectTo);
    } catch {
      setError(`Something went wrong. Email us at ${site.contactEmail}.`);
      setStatus("error");
    }
  }

  const id = `capture-${service}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor={id} className="block font-semibold">
        {headline}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className={`${inputClass} sm:max-w-sm`}
          aria-describedby={`${id}-disclosure${error ? ` ${id}-error` : ""}`}
        />
        <button type="submit" className="btn btn-primary" disabled={status === "submitting" || status === "done"}>
          {status === "done" ? "Sending you there now" : status === "submitting" ? "One moment…" : buttonLabel}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <p id={`${id}-disclosure`} className="text-sm opacity-80">
        {DISCLOSURE}
      </p>
      <Honeypot />
      <noscript>
        <p className="text-sm opacity-80">Enable JavaScript to send this form, or email {site.contactEmail}.</p>
      </noscript>
    </form>
  );
}
