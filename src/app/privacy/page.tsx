import type { Metadata } from "next";
import { site } from "@/config/site";
import { privacy } from "@/content/privacy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = buildMetadata({
  title: "Privacy",
  description: "How this site handles your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Section tone="white">
      <div className="prose-measure">
        <h1 className="h1 text-navy">Privacy</h1>
        <p className="mt-4 text-sm text-muted">Effective {privacy.effectiveDate}</p>
        {privacy.sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="h3 text-navy">{s.heading}</h2>
            <div className="mt-3 space-y-3">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <section className="mt-10">
          <h2 className="h3 text-navy">Who we are</h2>
          <p className="mt-3">
            {site.legalName}, {site.mailingAddress}. Questions and deletion requests:{" "}
            <a href={`mailto:${site.contactEmail}`} className="underline">
              {site.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </Section>
  );
}
