import type { Metadata } from "next";
import { home } from "@/content/home";
import { nicheList, joinNames } from "@/content/niches";
import { serviceList } from "@/content/services";
import { buildMetadata, websiteJsonLd } from "@/lib/seo";
import { Section, SectionHead } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
import { IndexList } from "@/components/ui/IndexList";
import { JsonLd } from "@/components/ui/JsonLd";
import { VideoPlayer } from "@/components/media/VideoPlayer";

export const metadata: Metadata = buildMetadata({
  title: `Marketing for ${joinNames(nicheList, { capitalized: true })}`,
  description:
    "Which marketing channel actually fits your trade, and which one will waste your money. Websites, Meta ads, local SEO and Google ads, ranked for your industry.",
  path: "/",
});

/**
 * Masthead, the four channels, the film, ground rules. Every action points
 * at the guide: it is the one next step, and it is the credibility.
 */
export default function HomePage() {
  const sub = home.sub.replace("{niches}", joinNames(nicheList));

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      <Section className="pb-20 pt-14 md:pb-32 md:pt-24">
        <div className="grid gap-x-5 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>{home.eyebrow}</Marker>
            <h1 className="display display-xl mt-7">{home.h1}</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">{sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Action href="/guide">Read the guide</Action>
              <Action href="/guide#niches" variant="quiet">
                Find your trade
              </Action>
            </div>
          </div>
        </div>
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead
          index={1}
          marker="What we do"
          title="Four channels. You probably need one."
          lede="Everyone sells all four. The difference between them is which trade you are in, and nobody tells you that part until after you have signed."
        />
        <div className="mt-12">
          <IndexList
            items={serviceList.map((s) => ({
              key: s.slug,
              title: s.name,
              body: s.oneLiner,
              aside: <p className="text-sm text-muted">{s.bestFor}</p>,
            }))}
          />
        </div>
        <p className="mt-10 grid grid-cols-12">
          <span className="col-span-12 md:col-span-9 md:col-start-4">
            <Action href="/guide" variant="outline">
              See all four ranked for your trade
            </Action>
          </span>
        </p>
      </Section>

      <Section className="py-16 md:py-28">
        <SectionHead index={2} marker="Film" title={home.vslHeading} />
        <div className="mt-12 grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <VideoPlayer slot="home" priority />
          </div>
          <ul className="md:col-span-4">
            {home.vslBullets.map((b, i) => (
              <li key={b} className="grid grid-cols-12 gap-x-4 border-t border-rule py-5">
                <span className="numeral col-span-2 text-lg md:col-span-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-10 md:col-span-9">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section ground="ink" className="py-20 md:py-28">
        <div className="grid gap-x-5 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Marker index={3}>{home.plainDealing.heading}</Marker>
            <p className="display display-lg mt-7">No surprises in the small print.</p>
          </div>
          <ul className="md:col-span-7 md:col-start-6">
            {home.plainDealing.bullets.map((b) => (
              <li key={b} className="lede border-t border-rule-dark py-6 !text-paper/85">
                {b}
              </li>
            ))}
          </ul>
          <div className="md:col-span-7 md:col-start-6">
            <Action href="/guide">Start with the guide</Action>
          </div>
        </div>
      </Section>
    </>
  );
}
