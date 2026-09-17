import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { niches, NICHE_SLUGS, isNicheSlug } from "@/content/niches";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { ServiceFitCard } from "@/components/guide/ServiceFitCard";
import { StartingMix } from "@/components/guide/StartingMix";

type Params = { niche: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return NICHE_SLUGS.map((niche) => ({ niche }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { niche } = await params;
  if (!isNicheSlug(niche)) return {};
  const n = niches[niche];
  return buildMetadata({ title: n.seo.title, description: n.seo.description, path: `/guide/${niche}` });
}

export default async function NichePage({ params }: { params: Promise<Params> }) {
  const { niche } = await params;
  if (!isNicheSlug(niche)) notFound();
  const n = niches[niche];
  const ranked = [...n.fits].sort((a, b) => a.rank - b.rank);
  const path = `/guide/${niche}`;

  return (
    <>
      <JsonLd data={articleJsonLd({ headline: n.headline, description: n.seo.description, path, about: n.name })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guide", path: "/guide" },
          { name: n.name, path },
        ])}
      />

      <Section tone="navy">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Guide: {n.name}</p>
          <h1 className="h1">{n.headline}</h1>
          <p className="mt-6 text-lg text-offwhite/85 md:text-xl">{n.intro}</p>
        </div>
      </Section>

      <Section tone="white" heading={`How ${n.name.toLowerCase()} customers actually buy`}>
        <ul className="prose-measure space-y-3">
          {n.buyerContext.map((b) => (
            <li key={b} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 text-amber-dark">
                &#9632;
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="offwhite" heading={`All four services, ranked for ${n.name.toLowerCase()}`}>
        <div className="space-y-6">
          {ranked.map((fit) => (
            <ServiceFitCard key={fit.service} fit={fit} />
          ))}
        </div>
      </Section>

      <Section tone="white" heading={n.startingMix.title}>
        <StartingMix mix={n.startingMix} />
      </Section>

      <Section tone="navy" heading="Want us to look at your specific situation?">
        <div className="flex flex-wrap gap-3">
          <Button href={`/contact?niche=${niche}`}>See if we&rsquo;re a fit</Button>
          <Button href="/services" variant="ghost">
            Compare the services &rarr;
          </Button>
        </div>
      </Section>
    </>
  );
}
