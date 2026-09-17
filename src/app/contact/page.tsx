import type { Metadata } from "next";
import { site } from "@/config/site";
import { contact } from "@/content/contact";
import { isServiceSlug } from "@/content/services";
import { isNicheFormValue } from "@/content/niches";
import { buildMetadata, contactPageJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { JsonLd } from "@/components/ui/JsonLd";
import { ContactForm } from "@/components/forms/ContactForm";

type Search = { service?: string; niche?: string };

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Tell us about the business and get a straight answer on whether we are a fit.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { service, niche } = await searchParams;
  const defaultService = service && isServiceSlug(service) ? service : undefined;
  const defaultNiche = niche && isNicheFormValue(niche) ? niche : undefined;

  return (
    <>
      <JsonLd data={contactPageJsonLd()} />

      <Section className="pb-12 pt-14 md:pb-16 md:pt-24">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>Contact</Marker>
            <h1 className="display display-xl mt-7">See if there&rsquo;s a good fit.</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">
              Tell us about the business. You get a written answer within {contact.replyWindow}, including if the
              answer is that we cannot help.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-24 md:pb-32">
        <div className="grid gap-x-5 gap-y-16 border-t border-ink pt-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <ContactForm defaultService={defaultService} defaultNiche={defaultNiche} />
          </div>
          <aside className="md:col-span-4 md:col-start-9">
            <p className="marker">What happens next</p>
            <ol className="mt-5">
              {contact.whatHappensNext.map((step, i) => (
                <li key={step} className="grid grid-cols-12 gap-x-4 border-t border-rule py-5">
                  <span className="numeral col-span-2 text-lg">{String(i + 1).padStart(2, "0")}</span>
                  <span className="col-span-10 text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted">
              Would rather just email?{" "}
              <a href={`mailto:${site.contactEmail}`} className="link">
                {site.contactEmail}
              </a>
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
