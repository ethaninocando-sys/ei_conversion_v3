import type { Metadata } from "next";
import Link from "next/link";
import { serviceList } from "@/content/services";
import { nichesForService } from "@/content/niches";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = buildMetadata({
  title: "Website, Meta Ads, Local SEO and Google Ads Services",
  description: "What each service includes, who it fits, and who it does not. Plain language, no hype.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Section tone="white" className="!pb-10">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Services</p>
          <h1 className="h1 text-navy">Four services, explained plainly</h1>
          <p className="mt-6 text-lg">
            Each page says who it is for, who it is not for, and what is included. Watch the short video first.
          </p>
        </div>
      </Section>
      <Section tone="white" className="!pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {serviceList.map((s) => {
            const fits = nichesForService(s.slug);
            return (
              <Card key={s.slug} title={s.name} href={`/services/${s.slug}`}>
                <p>{s.oneLiner}</p>
                <p className="mt-2 text-sm text-muted">{s.bestFor}</p>
                {fits.length > 0 && (
                  <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">Best for:</span>
                    {fits.map((n) => (
                      <span key={n.slug} className="rounded-sm border border-line px-2 py-0.5">
                        {n.name}
                      </span>
                    ))}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </Section>
      <Section tone="navy" heading="Not sure which one?">
        <p className="mb-6 text-lg text-offwhite/85">
          The guide ranks all four for your industry, downsides included.
        </p>
        <Button href="/guide" variant="secondary">
          Start with the guide
        </Button>
        <p className="mt-6 text-sm text-offwhite/70">
          Or go straight to the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
