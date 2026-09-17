import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS } from "@/content/types";
import { services, isServiceSlug } from "@/content/services";
import { nichesForService } from "@/content/niches";
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { publicPhase } from "@/lib/phase";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { EmailCapture } from "@/components/forms/EmailCapture";

type Params = { service: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service } = await params;
  if (!isServiceSlug(service)) return {};
  const s = services[service];
  return buildMetadata({ title: s.seo.title, description: s.seo.description, path: `/services/${service}` });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { service } = await params;
  if (!isServiceSlug(service)) notFound();
  const s = services[service];
  const path = `/services/${service}`;
  const fits = nichesForService(service);
  const phase = publicPhase();

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: s.name, description: s.seo.description, path })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.name, path },
        ])}
      />

      <Section tone="navy">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Service</p>
          <h1 className="h1">{s.name}</h1>
          <p className="mt-6 text-lg text-offwhite/85 md:text-xl">{s.promise}</p>
        </div>
      </Section>

      <Section tone="white">
        <VideoPlayer slot={`services.${service}.short`} />
      </Section>

      <Section tone="offwhite" heading="What is included">
        <ul className="grid gap-3 md:grid-cols-2">
          {s.included.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 text-success">
                &#10003;
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {s.honestLine && (
          <p className="mt-8 max-w-3xl rounded-md border border-line bg-white p-5 text-slate">{s.honestLine}</p>
        )}
      </Section>

      <Section tone="white" heading="Is it a fit?">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">A good fit if</p>
            <ul className="space-y-2">
              {s.goodFit.map((g) => (
                <li key={g} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-success">
                    &#10003;
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Not a fit if</p>
            <ul className="space-y-2">
              {s.notFit.map((g) => (
                <li key={g} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-muted">
                    &ndash;
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="offwhite" heading="How we work">
        <ol className="space-y-4">
          {s.process.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber font-heading font-bold text-navy">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-muted">{s.pricingLine}</p>
      </Section>

      {fits.length > 0 && (
        <Section tone="white" heading="Which trades it fits">
          <ul className="flex flex-wrap gap-3">
            {fits.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/guide/${n.slug}`}
                  className="inline-block rounded-md border border-line bg-white px-4 py-2 font-semibold text-navy hover:border-navy"
                >
                  {n.name} guide &rarr;
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="navy" heading={`Watch the full ${s.name} walkthrough`}>
        <p className="mb-6 max-w-2xl text-lg text-offwhite/85">
          The in-depth video covers {s.deepDive.teaser}.{" "}
          {phase >= 2 ? "Enter your email and we will send the link." : ""}
        </p>
        {phase >= 2 ? (
          <div className="max-w-2xl">
            <EmailCapture service={service} headline="Your email" buttonLabel="Send me the video" />
          </div>
        ) : (
          <Button href={`/learn/${service}`} variant="secondary">
            Watch the full walkthrough
          </Button>
        )}
      </Section>

      <Section tone="white" heading="Think this might be the one?">
        <Button href={`/contact?service=${service}`}>See if we&rsquo;re a fit</Button>
      </Section>
    </>
  );
}
