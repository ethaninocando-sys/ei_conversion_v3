import type { Metadata } from "next";
import { serviceList } from "@/content/services";
import { nichesForService } from "@/content/niches";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
import { IndexList } from "@/components/ui/IndexList";

export const metadata: Metadata = buildMetadata({
  title: "Websites, Meta Ads, Local SEO and Google Ads",
  description: "What each service includes, who it fits, and who it does not. Plain language, no hype.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Section className="pb-14 pt-14 md:pb-20 md:pt-24">
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <Marker>Services</Marker>
            <h1 className="display display-xl mt-7">Four services, explained plainly.</h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="lede">
              Each page says what is included, who it is for, and who it is not for. There is a short film on every
              one. Start there if you are deciding.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <IndexList
          items={serviceList.map((s) => {
            const fits = nichesForService(s.slug);
            return {
              key: s.slug,
              title: s.name,
              body: s.oneLiner,
              href: `/services/${s.slug}`,
              aside:
                fits.length > 0 ? (
                  <p className="marker">Best for {fits.map((n) => n.name).join(", ")}</p>
                ) : (
                  <p className="marker">Situational</p>
                ),
            };
          })}
        />
      </Section>

      <Section ground="ink" className="py-20 md:py-28">
        <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <Marker>Not sure which</Marker>
          </div>
          <div className="md:col-span-9">
            <p className="display display-lg">Don&rsquo;t pick from this page.</p>
            <p className="lede mt-5 measure !text-paper/75">
              The guide ranks all four for your trade and tells you which to skip. It takes about ten minutes and
              costs nothing.
            </p>
            <div className="mt-10">
              <Action href="/guide">Read the guide</Action>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
