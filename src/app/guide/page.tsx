import type { Metadata } from "next";
import { nicheList } from "@/content/niches";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
import { JsonLd } from "@/components/ui/JsonLd";
import { NichePicker } from "@/components/guide/NichePicker";

export const metadata: Metadata = buildMetadata({
  title: "The Guide, by Trade",
  description:
    "Pick roofing, med spa or plumbing. Every marketing channel ranked for that trade, with the downsides written out.",
  path: "/guide",
});

export default function GuidePage() {
  return (
    <>
      <JsonLd data={itemListJsonLd(nicheList.map((n) => ({ name: n.name, path: `/guide/${n.slug}` })))} />

      <Section className="pb-14 pt-14 md:pb-20 md:pt-24">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>The guide</Marker>
            <h1 className="display display-xl mt-7">Which marketing actually fits your trade?</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">
              Pick your business below. We rank all four channels for it, say what each one costs you as well as what
              it wins you, and give you an order to do them in.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-20 md:pb-28">
        <NichePicker items={nicheList.map((n) => ({ slug: n.slug, name: n.name, teaser: n.teaser }))} />
        <div className="mt-12 grid gap-x-5 gap-y-5 md:grid-cols-12">
          <p className="marker md:col-span-3">Not listed</p>
          <div className="md:col-span-9">
            <p className="lede measure">
              Tell us the trade and we will give you the same straight answer by email, whether or not we end up
              working together.
            </p>
            <div className="mt-6">
              <Action href="/contact?niche=other" variant="outline">
                Ask about your trade
              </Action>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
