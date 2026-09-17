"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { site } from "@/config/site";
import type { ServiceSlug } from "@/content/types";
import { subscribeSchema, fieldErrors } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { readAttributionCookie } from "@/lib/attribution";
import { Honeypot } from "@/components/forms/Honeypot";

interface Props {
  service: ServiceSlug;
  headline: string;
  buttonLabel: string;
}

/** Fixed disclosure. The wording is part of the spec; do not edit casually. */
export const DISCLOSURE = "You'll get the full video plus a short daily marketing puzzle. Unsubscribe anytime.";

/**
 * The email field that unlocks the deep-dive film. This IS the list opt-in;
 * there is no checkbox. Rendered only when the public phase is 2 or higher.
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
      setError(fieldErrors(parsed.error).email ?? "That email address does not look right.");
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
        setError(`That's a few too many tries. Give it an hour, or write to ${site.contactEmail}.`);
        setStatus("error");
        return;
      }
      const json = (await res.json().catch(() => null)) as { ok: true; redirectTo: string } | null;
      if (!res.ok || !json?.ok) {
        setError(`Something broke on our end. Write to ${site.contactEmail}.`);
        setStatus("error");
        return;
      }
      track("subscribe", { service });
      setStatus("done");
      router.push(json.redirectTo);
    } catch {
      setError(`Something broke on our end. Write to ${site.contactEmail}.`);
      setStatus("error");
    }
  }

  const id = `capture-${service}`;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <label htmlFor={id} className="marker block">
        {headline}
      </label>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end">
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="control sm:flex-1"
          aria-describedby={`${id}-disclosure${error ? ` ${id}-error` : ""}`}
        />
        <button type="submit" className="action shrink-0" disabled={status === "submitting" || status === "done"}>
          {status === "done" ? "Taking you there" : status === "submitting" ? "One moment" : buttonLabel}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-accent-light">
          {error}
        </p>
      )}
      <p id={`${id}-disclosure`} className="mt-4 text-sm opacity-70">
        {DISCLOSURE}
      </p>
      <Honeypot />
      <noscript>
        <p className="mt-3 text-sm opacity-70">Turn on JavaScript to send this, or email {site.contactEmail}.</p>
      </noscript>
    </form>
  );
}
