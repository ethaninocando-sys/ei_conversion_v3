import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <Section tone="white" eyebrow="404" heading="That page does not exist" headingLevel="h1">
      <p className="prose-measure mb-8">
        The link may be old, or the industry or service you are looking for is not on the site yet. The guide is
        the best place to start.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button href="/guide">Read the guide</Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
    </Section>
  );
}
