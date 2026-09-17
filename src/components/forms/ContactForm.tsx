"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { site } from "@/config/site";
import type { ServiceSlug } from "@/content/types";
import { nicheList, type NicheFormValue } from "@/content/niches";
import { serviceList } from "@/content/services";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { publicPhase } from "@/lib/phase";
import { readAttributionCookie } from "@/lib/attribution";
import { Field } from "@/components/ui/Field";
import { Action } from "@/components/ui/Action";
import { Honeypot } from "@/components/forms/Honeypot";

interface Props {
  defaultService?: ServiceSlug;
  defaultNiche?: NicheFormValue;
}

type Status = "idle" | "submitting" | "error";

const RATE_LIMIT_COPY = `That's a few too many tries. Give it an hour, or write to ${site.contactEmail}.`;
const GENERIC_ERROR_COPY = `Something broke on our end. Write to ${site.contactEmail} and we'll pick it up there.`;

/**
 * Phase 1: the fields render, but submit is a mailto link to the owner's
 * existing inbox, so nothing posts to a route that does not exist yet.
 * Phase 2+: posts JSON to /api/contact, then redirects to /thank-you.
 */
export function ContactForm({ defaultService, defaultNiche }: Props) {
  const router = useRouter();
  const phase = publicPhase();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase < 2) return;
    setStatus("submitting");
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      summary: String(fd.get("summary") ?? ""),
      service: String(fd.get("service") ?? ""),
      niche: String(fd.get("niche") ?? ""),
      company_website: String(fd.get("company_website") ?? ""),
      started_at: String(fd.get("started_at") ?? ""),
      attribution: readAttributionCookie(document.cookie) ?? {},
    };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus("error");
      return;
    }
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      if (res.status === 429) {
        setFormError(RATE_LIMIT_COPY);
        setStatus("error");
        return;
      }
      const json = (await res.json().catch(() => null)) as
        | { ok: true; leadId: string }
        | { ok: false; error?: { message?: string; fields?: Record<string, string> } }
        | null;
      if (!res.ok || !json || !json.ok) {
        if (json && !json.ok && json.error?.fields) setErrors(json.error.fields);
        else setFormError(GENERIC_ERROR_COPY);
        setStatus("error");
        return;
      }
      try {
        sessionStorage.setItem(
          "ei_contact",
          JSON.stringify({ service: parsed.data.service, niche: parsed.data.niche, leadId: json.leadId }),
        );
      } catch {
        /* sessionStorage unavailable; the thank-you page simply fires nothing */
      }
      router.push("/thank-you");
    } catch {
      setFormError(GENERIC_ERROR_COPY);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-9">
      <Field id="name" label="Name" required error={errors.name}>
        <input id="name" name="name" type="text" autoComplete="name" required className="control" />
      </Field>
      <Field id="email" label="Email" required error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="control" />
      </Field>
      <Field id="phone" label="Phone" error={errors.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="control" />
      </Field>
      <Field
        id="summary"
        label="What's going on with your marketing"
        required
        hint="What you have tried, what is not working, what you want more of. Two or three sentences is plenty."
        error={errors.summary}
      >
        <textarea id="summary" name="summary" rows={5} required minLength={20} maxLength={2000} className="control" />
      </Field>
      <div className="grid gap-9 sm:grid-cols-2">
        <Field id="service" label="Service in mind" error={errors.service}>
          <select id="service" name="service" defaultValue={defaultService ?? ""} className="control">
            <option value="">Not sure yet</option>
            {serviceList.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="niche" label="Your trade" error={errors.niche}>
          <select id="niche" name="niche" defaultValue={defaultNiche ?? ""} className="control">
            <option value="">Choose one</option>
            {nicheList.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.name}
              </option>
            ))}
            <option value="other">Something else</option>
          </select>
        </Field>
      </div>
      <Honeypot />

      {formError && (
        <p role="alert" className="text-accent">
          {formError}
        </p>
      )}

      {phase < 2 ? (
        <div className="space-y-4 pt-2">
          <Action href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("Fit check")}`}>
            Send this by email
          </Action>
          <p className="text-sm text-muted">
            The form goes live shortly. Until then, write to{" "}
            <a className="link" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="pt-2">
          <Action type="submit" disabled={status === "submitting"} trackEvent={false}>
            {status === "submitting" ? "Sending" : "Send it over"}
          </Action>
        </div>
      )}

      <noscript>
        <p className="text-sm text-muted">Turn on JavaScript to send this form, or email {site.contactEmail}.</p>
      </noscript>
    </form>
  );
}
