import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { niches, NICHE_SLUGS, isNicheSlug } from "@/content/niches";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Section, SectionHead } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
import { JsonLd } from "@/components/ui/JsonLd";
import { FitRow } from "@/components/guide/FitRow";
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

      <Section className="pb-14 pt-14 md:pb-20 md:pt-24">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>{`Guide \u00b7 ${n.name}`}</Marker>
            <h1 className="display display-xl mt-7">{n.headline}</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">{n.intro}</p>
          </div>
        </div>
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead index={1} marker="The buyer" title={`How ${n.name.toLowerCase()} customers actually buy`} />
        <ol className="mt-12 border-t border-rule">
          {n.buyerContext.map((b, i) => (
            <li key={b} className="grid grid-cols-12 gap-x-5 border-b border-rule py-6">
              <span className="numeral col-span-2 text-lg md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="col-span-10 md:col-span-8">{b}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="py-16 md:py-24">
        <SectionHead
          index={2}
          marker="The ranking"
          title={`All four, ranked for ${n.name.toLowerCase()}`}
          lede="Ordered by what we would spend your first money on. Every one has a cost column, including the ones we rank first."
        />
        <div className="mt-14">
          {ranked.map((fit) => (
            <FitRow key={fit.service} fit={fit} />
          ))}
        </div>
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead index={3} marker="The order" title={n.startingMix.title} />
        <div className="mt-12">
          <StartingMix mix={n.startingMix} />
        </div>
      </Section>

      <Section ground="ink" className="py-20 md:py-28">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Marker index={4}>Next</Marker>
          </div>
          <div className="md:col-span-9">
            <p className="display display-lg">Want this applied to your actual numbers?</p>
            <p className="lede mt-5 measure !text-paper/75">
              Tell us about the business and we will say, in writing, whether we can help and what we would do first.
              If the answer is no, you get that in writing too.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Action href={`/contact?niche=${niche}`}>See if we&rsquo;re a fit</Action>
              <Action href="/services" variant="quiet">
                Compare the four services
              </Action>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
