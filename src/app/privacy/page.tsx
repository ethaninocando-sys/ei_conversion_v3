import type { Metadata } from "next";
import { site } from "@/config/site";
import { privacy } from "@/content/privacy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";

export const metadata: Metadata = buildMetadata({
  title: "Privacy",
  description: "How this site handles your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Section className="pb-12 pt-14 md:pb-16 md:pt-24">
        <div className="grid gap-x-5 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>{`Effective ${privacy.effectiveDate}`}</Marker>
            <h1 className="display display-xl mt-7">Privacy</h1>
          </div>
        </div>
      </Section>

      <Section className="pb-24 md:pb-32">
        <div className="border-t border-ink">
          {privacy.sections.map((s, i) => (
            <section key={s.heading} className="grid gap-x-5 gap-y-5 border-b border-rule py-10 md:grid-cols-12">
              <div className="md:col-span-3">
                <Marker index={i + 1}>{s.heading}</Marker>
              </div>
              <div className="space-y-4 text-ink-soft md:col-span-8">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <section className="grid gap-x-5 gap-y-5 py-10 md:grid-cols-12">
            <div className="md:col-span-3">
              <Marker index={privacy.sections.length + 1}>Who we are</Marker>
            </div>
            <p className="text-ink-soft md:col-span-8">
              {site.legalName}, {site.mailingAddress}. Questions and deletion requests go to{" "}
              <a href={`mailto:${site.contactEmail}`} className="link">
                {site.contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
