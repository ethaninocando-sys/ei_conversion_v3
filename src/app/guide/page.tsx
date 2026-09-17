import type { Metadata } from "next";
import { nicheList } from "@/content/niches";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { NichePicker } from "@/components/guide/NichePicker";

export const metadata: Metadata = buildMetadata({
  title: "Marketing Guide by Industry",
  description:
    "Pick roofing, med spa, or plumbing and get all four marketing services ranked for it, pros and cons included.",
  path: "/guide",
});

export default function GuidePage() {
  return (
    <>
      <JsonLd data={itemListJsonLd(nicheList.map((n) => ({ name: n.name, path: `/guide/${n.slug}` })))} />
      <Section tone="white" className="!pb-10">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">The guide</p>
          <h1 className="h1 text-navy">Which marketing actually fits your industry?</h1>
          <p className="mt-6 text-lg">
            Pick your business type. We rank all four services for it, with the downsides included.
          </p>
        </div>
      </Section>
      <Section tone="white" className="!pt-0">
        <NichePicker items={nicheList.map((n) => ({ slug: n.slug, name: n.name, teaser: n.teaser }))} />
        <p className="mt-10 text-muted">
          Not listed? Tell us your industry and we will still give you a straight answer.
        </p>
        <div className="mt-4">
          <Button href="/contact?niche=other" variant="secondary">
            Tell us your industry
          </Button>
        </div>
      </Section>
    </>
  );
}
