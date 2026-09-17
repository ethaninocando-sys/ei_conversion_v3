import type { Metadata } from "next";
import { site } from "@/config/site";
import { contact } from "@/content/contact";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ContactConversion } from "./ContactConversion";

export const metadata: Metadata = buildMetadata({
  title: "Thanks",
  description: "Message received.",
  path: "/thank-you",
  noindex: true,
});

/** Contact conversion page only. Subscribe success is inline in EmailCapture. */
export default function ThankYouPage() {
  return (
    <Section tone="white" headingLevel="h1" heading="Got it. We'll be in touch.">
      <ContactConversion />
      <p className="prose-measure text-lg">
        {site.ownerFirstName} reads every message personally. Expect a reply within {contact.replyWindow}. In the
        meantime, the guide is the best use of ten minutes.
      </p>
      <div className="mt-8">
        <Button href="/guide">Back to the guide</Button>
      </div>
    </Section>
  );
}
