import type { Metadata } from "next";
import { site } from "@/config/site";
import { contact } from "@/content/contact";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";
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
    <Section className="pb-24 pt-14 md:pb-32 md:pt-24">
      <ContactConversion />
      <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <Marker>Received</Marker>
          <h1 className="display display-xl mt-7">Got it. We&rsquo;ll be in touch.</h1>
        </div>
        <div className="md:col-span-4 md:self-end">
          <p className="lede">
            {site.ownerFirstName} reads every message personally, so the reply comes from a person and not a
            sequence. Expect it within {contact.replyWindow}.
          </p>
          <div className="mt-9">
            <Action href="/guide" variant="outline">
              Read the guide meanwhile
            </Action>
          </div>
        </div>
      </div>
    </Section>
  );
}
