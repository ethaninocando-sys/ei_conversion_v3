import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Marker } from "@/components/ui/Marker";
import { Action } from "@/components/ui/Action";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <Section className="pb-24 pt-14 md:pb-32 md:pt-24">
      <div className="grid gap-x-5 gap-y-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <Marker>Error 404</Marker>
          <h1 className="display display-xl mt-7">That page isn&rsquo;t here.</h1>
        </div>
        <div className="md:col-span-4 md:self-end">
          <p className="lede">
            The link may be old, or the trade you are after is not covered yet. The guide is the place to start
            either way.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Action href="/guide">Read the guide</Action>
            <Action href="/" variant="quiet">
              Back to the front
            </Action>
          </div>
        </div>
      </div>
    </Section>
  );
}
