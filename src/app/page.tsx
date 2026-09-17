import type { Metadata } from "next";
import { home } from "@/content/home";
import { nicheList, joinNames } from "@/content/niches";
import { serviceList } from "@/content/services";
import { buildMetadata, websiteJsonLd } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/ui/JsonLd";
import { VideoPlayer } from "@/components/media/VideoPlayer";

export const metadata: Metadata = buildMetadata({
  title: `Marketing for ${joinNames(nicheList, { capitalized: true })}`,
  description:
    "Straight advice on websites, Meta ads, local SEO and Google ads for local service businesses. Read the free guide first.",
  path: "/",
});

/**
 * Exactly four sections: hero, sub-hero, VSL, closing band.
 * Every button points to /guide. Home never links directly to /contact.
 */
export default function HomePage() {
  const sub = home.sub.replace("{niches}", joinNames(nicheList));
  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      <Section tone="navy" className="!py-20 md:!py-32">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{home.eyebrow}</p>
          <h1 className="h1">{home.h1}</h1>
          <p className="mt-6 text-lg text-offwhite/85 md:text-xl">{sub}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/guide">Read the free guide</Button>
            <Button href="/guide#niches" variant="ghost">
              Pick your industry &rarr;
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="white" heading="Four services. You probably need one or two.">
        <div className="grid gap-4 md:grid-cols-4">
          {serviceList.map((s) => (
            <Card key={s.slug} title={s.name}>
              <p>{s.oneLiner}</p>
              <p className="mt-3 text-sm text-muted">{s.bestFor}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-muted">The guide tells you which ones fit your trade, and which to skip.</p>
        <div className="mt-6">
          <Button href="/guide" variant="secondary">
            Find your industry in the guide
          </Button>
        </div>
      </Section>

      <Section tone="offwhite" heading={home.vslHeading}>
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <VideoPlayer slot="home" priority />
          </div>
          <ul className="space-y-4 md:col-span-2">
            {home.vslBullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 text-amber-dark">
                  &#9632;
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10">
          <Button href="/guide">Find your industry in the guide</Button>
        </div>
      </Section>

      <Section tone="navy" heading={home.plainDealing.heading}>
        <ul className="grid gap-4 md:grid-cols-2">
          {home.plainDealing.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-lg">
              <span aria-hidden="true" className="text-amber">
                &ndash;
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Button href="/guide" variant="secondary">
            Start with the guide
          </Button>
        </div>
      </Section>
    </>
  );
}
