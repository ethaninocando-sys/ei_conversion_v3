import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_SLUGS } from "@/content/types";
import { services, isServiceSlug } from "@/content/services";
import { buildMetadata } from "@/lib/seo";
import { publicPhase } from "@/lib/phase";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
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
 * Deep-dive page. Public, not in nav or sitemap, noindex. The email is the
 * gate to the link, not a login. The welcome email links here.
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
      <Section tone="white" className="!pb-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Deep dive</p>
          <h1 className="h1 text-navy">{s.name}: the full walkthrough</h1>
        </div>
      </Section>

      <Section tone="white" className="!pt-0">
        <VideoPlayer slot={`learn.${service}`} />
      </Section>

      <Section tone="offwhite" heading="Chapters">
        <div className="grid gap-10 md:grid-cols-2">
          <ol className="space-y-3">
            {s.deepDive.chapters.map((c, i) => (
              <li key={c.label} className="flex gap-4">
                <span className="w-8 shrink-0 font-heading font-bold text-navy">{i + 1}.</span>
                <span>
                  {c.label}
                  {c.at ? <span className="ml-2 text-sm text-muted">{c.at}</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <div>
            <p className="eyebrow mb-3">Common mistakes</p>
            <ul className="space-y-2">
              {s.deepDive.mistakes.map((m) => (
                <li key={m} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-muted">
                    &ndash;
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="navy" heading="Want this applied to your business?">
        <Button href={`/contact?service=${service}`}>See if we&rsquo;re a fit</Button>
        {justUnlocked && (
          <p className="mt-8 text-sm text-offwhite/75">
            {phase >= 3
              ? "Your first daily puzzle arrives within a day."
              : "You'll also get our short daily marketing puzzle when it launches."}
          </p>
        )}
      </Section>
    </>
  );
}
