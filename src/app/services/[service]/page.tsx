import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS } from "@/content/types";
import { services, isServiceSlug } from "@/content/services";
import { nichesForService } from "@/content/niches";
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { publicPhase } from "@/lib/phase";
import { Section, SectionHead } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
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

      <Section className="pb-12 pt-14 md:pb-16 md:pt-24">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>Service</Marker>
            <h1 className="display display-xl mt-7">{s.name}</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">{s.promise}</p>
          </div>
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <VideoPlayer slot={`services.${service}.short`} />
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead index={1} marker="Included" title="What you actually get" />
        <div className="mt-12 grid gap-x-5 md:grid-cols-12">
          <ul className="border-t border-rule md:col-span-8 md:col-start-4">
            {s.included.map((item) => (
              <li key={item} className="border-b border-rule py-4">
                {item}
              </li>
            ))}
          </ul>
          {s.honestLine && (
            <p className="lede mt-10 border-l-2 border-accent pl-6 md:col-span-8 md:col-start-4">{s.honestLine}</p>
          )}
        </div>
      </Section>

      <Section className="py-16 md:py-24">
        <SectionHead index={2} marker="Fit" title="Who this is for" />
        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
          <div>
            <p className="marker mb-4">Worth your money if</p>
            <ul className="space-y-3 text-ink-soft">
              {s.goodFit.map((g) => (
                <li key={g} className="border-t border-rule pt-3 first:border-t-0 first:pt-0">
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:border-l md:border-rule md:pl-10">
            <p className="marker mb-4">Don&rsquo;t bother if</p>
            <ul className="space-y-3 text-ink-soft">
              {s.notFit.map((g) => (
                <li key={g} className="border-t border-rule pt-3 first:border-t-0 first:pt-0">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead index={3} marker="Process" title="How we work" />
        <div className="mt-12 grid gap-x-5 gap-y-10 md:grid-cols-12">
          <ol className="md:col-span-7">
            {s.process.map((step, i) => (
              <li key={step} className="grid grid-cols-12 gap-x-5 border-t border-rule py-6">
                <span className="numeral col-span-2 text-xl md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-10 md:col-span-11">{step}</span>
              </li>
            ))}
          </ol>
          <aside className="md:col-span-4 md:col-start-9">
            <p className="marker">What it costs</p>
            <p className="mt-4 text-ink-soft">{s.pricingLine}</p>
          </aside>
        </div>
      </Section>

      {fits.length > 0 && (
        <Section className="py-16 md:py-20">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-12">
            <p className="marker md:col-span-3">Trades it suits</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-9">
              {fits.map((n) => (
                <li key={n.slug}>
                  <Link href={`/guide/${n.slug}`} className="display display-md link">
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section ground="ink" className="py-20 md:py-28">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Marker index={4}>The long version</Marker>
          </div>
          <div className="md:col-span-9">
            <p className="display display-lg">The full {s.name} walkthrough.</p>
            <p className="lede mt-5 measure !text-paper/75">
              It covers {s.deepDive.teaser}. {phase >= 2 ? "Leave an email and we will send you the link." : ""}
            </p>
            <div className="mt-10">
              {phase >= 2 ? (
                <EmailCapture service={service} headline="Your email" buttonLabel="Send me the film" />
              ) : (
                <Action href={`/learn/${service}`} variant="outline">
                  Watch the walkthrough
                </Action>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-24">
        <div className="grid gap-x-5 gap-y-6 md:grid-cols-12">
          <p className="marker md:col-span-3">Talk to us</p>
          <div className="md:col-span-9">
            <p className="display display-lg">Think this is the one?</p>
            <div className="mt-8">
              <Action href={`/contact?service=${service}`}>See if we&rsquo;re a fit</Action>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
