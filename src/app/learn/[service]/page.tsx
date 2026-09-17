import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS } from "@/content/types";
import { services, isServiceSlug } from "@/content/services";
import { buildMetadata } from "@/lib/seo";
import { publicPhase } from "@/lib/phase";
import { Section, SectionHead } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
import { VideoPlayer } from "@/components/media/VideoPlayer";

type Params = { service: string };
type Search = { src?: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service } = await params;
  if (!isServiceSlug(service)) return {};
  const s = services[service];
  return buildMetadata({
    title: `${s.name} walkthrough`,
    description: `The full ${s.name} walkthrough for local service businesses.`,
    path: `/learn/${service}`,
    noindex: true,
  });
}

/**
 * The deep dive. Public but unlisted and noindex: the email is the gate to
 * the link, not a login. The welcome email points here.
 */
export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { service } = await params;
  const { src } = await searchParams;
  if (!isServiceSlug(service)) notFound();
  const s = services[service];
  const phase = publicPhase();
  const justUnlocked = src === "unlock";

  return (
    <>
      <Section className="pb-12 pt-14 md:pb-16 md:pt-24">
        <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-9">
            <Marker>Deep dive</Marker>
            <h1 className="display display-xl mt-7">{s.name}: the full walkthrough</h1>
          </div>
        </div>
      </Section>

      <Section className="pb-16 md:pb-24">
        <VideoPlayer slot={`learn.${service}`} priority />
      </Section>

      <Section ground="dim" className="py-16 md:py-24">
        <SectionHead index={1} marker="Contents" title="What it covers" />
        <div className="mt-12 grid gap-x-5 gap-y-12 md:grid-cols-12">
          <ol className="border-t border-rule md:col-span-7">
            {s.deepDive.chapters.map((c, i) => (
              <li key={c.label} className="grid grid-cols-12 gap-x-5 border-b border-rule py-4">
                <span className="numeral col-span-2 text-lg md:col-span-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-8 md:col-span-8">{c.label}</span>
                {c.at && <span className="marker col-span-2 text-right">{c.at}</span>}
              </li>
            ))}
          </ol>
          <aside className="md:col-span-4 md:col-start-9">
            <p className="marker">Mistakes it will save you</p>
            <ul className="mt-4 space-y-3 text-ink-soft">
              {s.deepDive.mistakes.map((m) => (
                <li key={m} className="border-t border-rule pt-3 first:border-t-0 first:pt-0">
                  {m}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section ground="ink" className="py-20 md:py-28">
        <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <Marker index={2}>Next</Marker>
          </div>
          <div className="md:col-span-9">
            <p className="display display-lg">Want this run on your account?</p>
            <div className="mt-10">
              <Action href={`/contact?service=${service}`}>See if we&rsquo;re a fit</Action>
            </div>
            {justUnlocked && (
              <p className="mt-10 border-t border-rule-dark pt-6 text-sm !text-paper/60">
                {phase >= 3
                  ? "Your first daily puzzle arrives within a day."
                  : "You'll also get our short daily marketing puzzle when it launches."}
              </p>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
