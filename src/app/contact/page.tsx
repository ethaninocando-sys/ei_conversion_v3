import type { Metadata } from "next";
import { site } from "@/config/site";
import { contact } from "@/content/contact";
import { isServiceSlug } from "@/content/services";
import { isNicheFormValue } from "@/content/niches";
import { buildMetadata, contactPageJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/ui/JsonLd";
import { ContactForm } from "@/components/forms/ContactForm";

type Search = { service?: string; niche?: string };

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Tell us about your business and get an honest answer on whether we are a fit.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { service, niche } = await searchParams;
  const defaultService = service && isServiceSlug(service) ? service : undefined;
  const defaultNiche = niche && isNicheFormValue(niche) ? niche : undefined;

  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <Section tone="white" className="!pb-8">
        <div className="max-w-3xl">
          <h1 className="h1 text-navy">See if there&rsquo;s a good fit</h1>
          <p className="mt-6 text-lg">
            Tell us a little about the business. We reply within {contact.replyWindow} with an honest read on
            whether we can help.
          </p>
        </div>
      </Section>
      <Section tone="white" className="!pt-0">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-3">
            <ContactForm defaultService={defaultService} defaultNiche={defaultNiche} />
          </div>
          <aside className="md:col-span-2">
            <p className="eyebrow mb-4">What happens next</p>
            <ol className="space-y-4">
              {contact.whatHappensNext.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber font-heading font-bold text-navy">
                    {i + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted">
              Prefer email?{" "}
              <a href={`mailto:${site.contactEmail}`} className="underline">
                {site.contactEmail}
              </a>
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
