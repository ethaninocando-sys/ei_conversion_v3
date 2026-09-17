"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { site } from "@/config/site";
import { SERVICE_SLUGS, type ServiceSlug } from "@/content/types";
import { NICHE_FORM_VALUES, nicheList, type NicheFormValue } from "@/content/niches";
import { serviceList } from "@/content/services";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { publicPhase } from "@/lib/phase";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/forms/Honeypot";
import { readAttributionCookie } from "@/lib/attribution";

interface Props {
  defaultService?: ServiceSlug;
  defaultNiche?: NicheFormValue;
}

type Status = "idle" | "submitting" | "error";

const RATE_LIMIT_COPY = `Too many attempts. Try again later or email us at ${site.contactEmail}.`;
const GENERIC_ERROR_COPY = `Something went wrong. Email us at ${site.contactEmail}.`;

/**
 * Phase 1: the fields render, but the submit button is a mailto link to the
 * owner's existing inbox, so nothing posts to a route that does not exist yet.
 * Phase 2+: posts JSON to /api/contact and redirects to /thank-you.
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
        // sessionStorage unavailable; the thank-you page simply fires nothing
      }
      router.push("/thank-you");
    } catch {
      setFormError(GENERIC_ERROR_COPY);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={formError ? "form-error" : undefined}>
      <Field id="name" label="Name" required error={errors.name}>
        <input id="name" name="name" type="text" autoComplete="name" required className={inputClass} />
      </Field>
      <Field id="email" label="Email" required error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field id="phone" label="Phone" error={errors.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field
        id="summary"
        label="What's going on with your marketing right now?"
        required
        hint="A couple of sentences is plenty. What you have tried, what is not working, what you want more of."
        error={errors.summary}
      >
        <textarea id="summary" name="summary" rows={5} required minLength={20} maxLength={2000} className={inputClass} />
      </Field>
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="service" label="Service you're interested in" error={errors.service}>
          <select id="service" name="service" defaultValue={defaultService ?? ""} className={inputClass}>
            <option value="">Not sure</option>
            {serviceList.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="niche" label="Your industry" error={errors.niche}>
          <select id="niche" name="niche" defaultValue={defaultNiche ?? ""} className={inputClass}>
            <option value="">Choose one</option>
            {nicheList.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Honeypot />

      {formError && (
        <p id="form-error" role="alert" className="text-error">
          {formError}
        </p>
      )}

      {phase < 2 ? (
        <div className="space-y-3">
          <Button href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("Fit check")}`}>Email us</Button>
          <p className="text-sm text-muted">
            Or write to{" "}
            <a className="underline" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
      ) : (
        <Button type="submit" disabled={status === "submitting"} trackEvent={false}>
          {status === "submitting" ? "Sending…" : "Send it over"}
        </Button>
      )}

      <noscript>
        <p className="text-sm text-muted">
          Enable JavaScript to send this form, or email {site.contactEmail}.
        </p>
      </noscript>
    </form>
  );
}

// Re-exported for prefill validation on the server page.
export const CONTACT_SERVICE_VALUES = SERVICE_SLUGS;
export const CONTACT_NICHE_VALUES = NICHE_FORM_VALUES;
